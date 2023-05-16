var express = require("express");
var router = express.Router();
const fs = require("fs");
require("dotenv").config();
const { Parser } = require("json2csv"); // json to csv converter

const { usersModel } = require("../model/users");

const { addHours, addMinutes, removeMinutes } = require("../common/functions");
const nodeMailer = require("../email-sender");

/* Users. */
router.get("/", async function (req, res, next) {
  try {
    // pagination variables
    const limit = 4;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const pipeline = [];
    let sortBy = "createdAt";
    let sortOrder = -1;

    // add full name field in user's document
    pipeline.push({
      $addFields: {
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
      },
    });

    // when search user
    if (req.query.search) {
      console.log("search =>", req.query);
      pipeline.push({
        $match: {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { fullName: { $regex: req.query.search, $options: "i" } },
          ],
        },
      });
    }

    // when sort user
    if (req.query.sortOrder) {
      console.log("req.query =>", req.query);
      sortOrder = Number(req.query.sortOrder);
    }

    // lookup 1
    pipeline.push({
      $lookup: {
        from: "savedposts",
        localField: "_id",
        foreignField: "savedBy",
        as: "savedPost",
      },
    });

    // lookup 2
    pipeline.push({
      $lookup: {
        from: "posts",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$userId", "$postBy"],
              },
              isArchived: false,
            },
          },
        ],
        as: "createPost",
      },
    });

    // all user without skip limit
    const allUserList = await usersModel.aggregate(pipeline);
    // count of total user (without skip limit)
    const totalUsers = allUserList.length;

    // project
    pipeline.push({
      $project: {
        firstName: 1,
        lastName: 1,
        fullName: 1,
        gender: 1,
        email: 1,
        createdAt: 1,
        profilePicture: 1,
        totalSavedPost: { $size: "$savedPost" },
        totalCreatedPost: { $size: "$createPost" },
      },
    });

    pipeline.push({
      $sort: { [sortBy]: sortOrder },
    });

    pipeline.push({ $skip: skip }, { $limit: limit });
    // console.log("pipeline =>", JSON.stringify(pipeline, null,2));

    // user list with details
    const usersList = await usersModel.aggregate(pipeline);

    // total no of pages
    const pages = [];
    for (let i = 1; i <= Math.ceil(totalUsers / limit); i++) {
      pages.push(i);
    }
    console.log("usersList =>", usersList);
    console.log("totalUsers =>", totalUsers);
    console.log("no of pages =>", pages);
    console.log("current page =>", page);

    res.render("users/index", {
      title: "users",
      usersList: usersList,
      totalUsers: totalUsers,
      search: req.query.search,
      pages: pages,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    res.render("error", { message: error });
  }
});

/* User Email verification */
router.get("/:userId/email-verification/", async (req, res, next) => {
  try {
    // when user is user already verify & click on verification link
    const userDetail = await usersModel
      .findOne(
        { _id: req.params.userId },
        {
          firstName: 1,
          lastName: 1,
          lastVerifyLinkSend: 1,
          totalVerifyLinkSend: 1,
          isVerify: 1,
        }
      )
      .lean();
    if (userDetail.isVerify == true) {
      return res.render("email/email-verification", {
        title: "email verification",
        layout: "auth",
        userDetail: userDetail,
        usrAlreadyVerify: true,
      });
    }

    // when link is expired (expire time 1 hour)
    const nowDate = new Date().getTime();
    const lastSendDate = new Date(userDetail.lastVerifyLinkSend).getTime();
    //create expire date of link by 1 hour
    const expireDate = addHours(
      new Date(userDetail.lastVerifyLinkSend),
      Number(process.env.LINK_EXPIRE_TIME)
    ); // add 1 hour in lastLinkSendTime
    const timeDifference = (nowDate - lastSendDate) / 1000 / 60 / 60;
    if (timeDifference > Number(process.env.LINK_EXPIRE_TIME)) {
      return res.render("email/email-verification", {
        title: "email verification",
        layout: "auth",
        userDetail: userDetail,
        verifyLinkExpire: true,
        expireDate: expireDate,
      });
    }

    // update user email is verify true
    await usersModel.updateOne(
      { _id: req.params.userId },
      { $set: { isVerify: true, verificationDate: new Date() } }
    );
    const userName = usersModel
      .findOne({ _id: req.params.userId }, { firstName: 1, lastName: 1 })
      .lean();

    res.render("email/email-verification", {
      title: "email verification",
      layout: "auth",
      userName: userName,
      usrAlreadyVerify: false,
    });
  } catch (error) {
    res.render("error", { message: error });
  }
});

/* email verification resend link */
router.post(
  "/:userId/email-verification/resend-link",
  async (req, res, next) => {
    try {
      const userDetail = await usersModel.findOne({ _id: req.params.userId });

      // when verification attempt more then 5 times
      if (userDetail.totalVerifyLinkSend >= Number(process.env.LINK_LIMIT)) {
        console.log("Your Verification Attempts are Over");
        return res.send({
          type: "error",
          message: "Your Verification Attempts are Over",
        });
      }

      // when once sended link & before 15 minute click next time on verification btn send warning
      const nowDate = new Date().getTime();
      const lastLinkSendTime = new Date(
        userDetail.lastVerifyLinkSend
      ).getTime();
      const timeDifference = (nowDate - lastLinkSendTime) / 1000 / 60;

      if (timeDifference < Number(process.env.LINK_RESEND_TIME)) {
        const remainingTime = (
          Number(process.env.LINK_RESEND_TIME) - timeDifference
        ).toFixed(2);
        console.log("remainingTime", remainingTime);
        return res.send({
          type: "warning",
          message: `Please, try again after ${remainingTime} minutes`,
        });
      }

      // send verification link on user email
      const mailOptions = {
        userEmail: userDetail.email,
        subject: "My-Circle | Email Verification",
        html: `<p>Hello <b>${userDetail.firstName} ${userDetail.lastName},</b><br>
      Verify your email</p><a href="http://localhost:3000/users/${userDetail._id}/email-verification" >Verify email</a>`,
      };
      nodeMailer.sendMail(mailOptions);

      // increase count of verification link & update last link send time
      const increaseTotal = userDetail.totalVerifyLinkSend + 1;
      await usersModel.updateOne(
        { _id: req.params.userId },
        {
          $set: {
            totalVerifyLinkSend: increaseTotal,
            lastVerifyLinkSend: new Date(),
          },
        }
      );

      res.send({
        type: "success",
        message: "Verification Link sended on Your Email",
      });
    } catch (error) {
      res.render("error", { message: error });
    }
  }
);

/* export users in csv */
router.get("/export-csv", async (req, res, next) => {
  try {

    // return console.log("req.query", req.query);

    const pipeline = [];
    let sortBy = "createdAt";
    let sortOrder = -1;

    // add full name field in user's document
    pipeline.push({
      $addFields: {
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
      },
    });

    // when search user
    if (req.query.search) {
      console.log("search =>", req.query);
      pipeline.push({
        $match: {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { fullName: { $regex: req.query.search, $options: "i" } },
          ],
        },
      });
    }

    // when sort user
    if (req.query.sortOrder) {
      console.log("req.query =>", req.query);
      sortOrder = Number(req.query.sortOrder);
    }

    // lookup 1
    pipeline.push({
      $lookup: {
        from: "savedposts",
        localField: "_id",
        foreignField: "savedBy",
        as: "savedPost",
      },
    });

    // lookup 2
    pipeline.push({
      $lookup: {
        from: "posts",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$userId", "$postBy"],
              },
              isArchived: false,
            },
          },
        ],
        as: "createPost",
      },
    });

    // project
    pipeline.push({
      $project: {
        firstName: 1,
        lastName: 1,
        fullName: 1,
        gender: 1,
        email: 1,
        createdAt: 1,
        profilePicture: 1,
        totalSavedPost: { $size: "$savedPost" },
        totalCreatedPost: { $size: "$createPost" },
      },
    });

    // sort
    pipeline.push({
      $sort: { [sortBy]: sortOrder },
    });

    const userDetail = await usersModel.aggregate(pipeline);
    console.log("usersDetails =>",userDetail);
      
    // convert DB data => CSV
    const fields = [
      {
        label:"First Name",   // custom field
        value:"firstName"     // db's field
      },
      {
        label:"Last Name",
        value:"lastName"
      },
      {
        label:"Gender",
        value:"gender"
      },
      {
        label:"Email",
        value:"email"
      },
      {
        label:"Total Saved Post",
        value:"totalSavedPost"
      },
      {
        label:"Total Added Post",
        value:"totalCreatedPost"
      }
    ]
    const parser = new Parser({ fields });
    const csv = parser.parse(userDetail);
    console.log("csv =>",csv);
    
    // set header content type csv
    // res.setHeader('Content-Type', 'text/csv');
    // res.setHeader("Content-Disposition", 'attachment; filename=My-Circle-Users.csv');
    res.send(csv);

  } catch (error) {
    res.render("error", { error: error });
  }
});

module.exports = router;
