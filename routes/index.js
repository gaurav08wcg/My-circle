const express = require("express");
const router = express.Router();
const md5 = require("md5");
const passport = require("passport");
const ObjectId = require("mongoose").Types.ObjectId;
// const LocalStrategy = require("passport-local").Strategy;

const auth = require("../auth");
const nodeMailer = require("../email-sender");   // node mailer
// const serverSocket = require("../server-socket");

/* models */
const { usersModel } = require("../model/users");
const { postModel } = require("../model/post");
const { savedPostModel } = require("../model/saved-post");
// const { notificationModel } = require("../model/notifications");

/* --------- passport authentication configuration ----------  */
auth.localStrategyInitialization();
auth.serializeUser();
auth.deserializeUser();

/* email validation */
router.get("/validate/email", async (req, res, next) => {
  try {
    console.log("req.query", req.query);
    const condition = { email: req.query.email }

    // when user edit their profile 
    if (req.query.userId) {
      condition["_id"] = { $ne: new ObjectId(req.user._id) }
    }

    const isEmail = await usersModel.findOne(condition, { email: 1 })

    // when email is exist 
    if (isEmail) return res.send(false);

    return res.send(true);

  } catch (error) {
    res.render("error", { message: error });
  }
});

/* GET home page ( Landing page ). */
router.get("/", async function (req, res, next) {
  try {

    // create new room name of userId and store their sockets
    // serverSocket.createRoom();

    // query data
    const filter = req.query.filter;
    const sortBy = req.query.sortBy;
    const order = Number(req.query.order);

    // pagination variables 
    const limit = 5;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let search = req.query.search;
    // console.log("req.query.search =>",req.query.search);

    // if user click on archive
    if (req.query.archive) await postModel.updateOne({ _id: new ObjectId(req.query.postId) }, { isArchived: true })

    // for sorting key value
    let sortType = "createdAt";
    let sortOrder = -1;

    const match = {
      $match: {
        isArchived: false,
      },
    };


    // if user do filter post
    if (filter) {
      // match.$match["$or"] = [];
      // console.log("$or =>", match.$match);
      switch (filter) {
        // user select "mine post"
        case "mine":
          match.$match["postBy"] = new ObjectId(req.user._id)
          // match.$match?.$or?.push({ "postBy": new ObjectId(req.user._id) })
          console.log("filter-mine =>", match.$match.$or);
          break;


        // user select "mine post"
        case "other":
          match.$match["postBy"] = { $ne: new ObjectId(req.user._id) }
          // match.$match?.$or?.push({ "postBy": { $ne: new ObjectId(req.user._id) } })
          console.log("filter-other =>", match.$match.$or);
          break;

        default:
          break;
      }
    }

    // if search a post
    if (search) {
      match.$match["$or"] = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log("filter + search =>", match.$match.$or);
    }

    console.log("filter =>", filter);
    console.log("search =>", search);

    // if sort post
    if (sortBy) {
      // title
      if (sortBy == "title") {

        sortType = sortBy;
        sortOrder = order;

        // sortType = "title";
        // sortOrder = 1;
        console.log("pipeline sort =>", sortType, sortOrder);
      }

      // date time
      if (sortBy == "dateTime") {
        sortType = "createdAt";
        sortOrder = order;
      }
    }

    const pipeline = [];

    pipeline.push(match);
    // pipeline.push({
    //   $lookup: {
    //     from: "users",
    //     localField: "postBy",
    //     foreignField: "_id",
    //     as: "post_with_users",
    //   },
    // });

    /* lookup with user */
    pipeline.push({
      $lookup: {
        from: "users",
        let: { postBy: "$postBy" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$postBy"],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              createdAt: 1,
              profilePicture: "$profilePicture.name",
            },
          },
        ],
        as: "postOwner",
      },
    });

    /* lookup with comments */
    pipeline.push({
      $lookup: {
        from: "comments",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$postId"],
              },
            },
          },
          {
            $group: { _id: null, total: { $sum: 1 } },
          },
        ],
        as: "comments",
      },
    });

    // --------- all post without skip limit --------------- 
    const allPostList = await postModel.aggregate(pipeline);
    // count of total post (without skip limit)
    const totalPost = allPostList.length

    /* =========== new projection ============ */
    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        postBy: 1,
        postBy: { $first: "$post_with_users" },
        postImage: "$postImage.name",
        createdAt: 1,
        postBy: { $arrayElemAt: ["$postOwner", 0] },
        totalComments: { $arrayElemAt: ["$comments.total", 0] },
      },
    });

    // pipeline.push({
    //   $project: {
    //     title: 1,
    //     description: 1,
    //     postBy: 1,
    //     postBy: { $first: "$post_with_users" },
    //     postImage: "$postImage.name",
    //     createdAt: 1,
    //   },
    // });
    pipeline.push({
      $sort: {
        [sortType]: sortOrder
      }
    });

    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    )

    const allPost = await postModel.aggregate(pipeline);
     // count of total post (without skip limit)
    // const totalPost = allPostList.length
    const savedPostData = await savedPostModel.find();
    // console.log("pipeline =>", pipeline);
    console.log("allPost =>", allPost);

    // total no of pages
    const pages = [];
    for (let i = 1; i <= Math.ceil(totalPost / limit); i++) {
      pages.push(i);
    }
    console.log("no of pages =>", pages);

    res.render("index", {
      title: "Home",
      posts: allPost,
      totalPosts: totalPost,
      pages: pages,
      totalPages: Math.ceil(totalPost / limit),
      currentPage: page,
      savedPostData:savedPostData,
      message : req.flash('message'),
      className: 'success'
    });
  } catch (error) {
    console.log("error => ", error);
    res.render("error", { message: error });
  }
});

/* Signup */
router.get("/signup", (req, res, next) => {
  try {
    res.render("signup/index", { layout: "auth", title: "sign up" });
  } catch (error) {
    console.log("error =>", error);
    res.render("error", { message: error });
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const bodyData = req.body;
    bodyData["password"] = md5(req.body.password);
    bodyData["totalVerifyLinkSend"] = 1;

    // create user
    await usersModel.create(bodyData);

    // find created user's Object id
    const userId = await usersModel.findOne({email: bodyData.email},{_id:1});
    console.log("userId", userId._id);

    // send Registration Successfully mail to user account
    const mailOptions = {
      userEmail: bodyData.email,
      subject: "My-Circle Registration",
      html: `<p>Your Registration Successfully, <b>${bodyData.firstName} ${bodyData.lastName},</b><br>
      please verify your email</p><a href="http://localhost:3000/users/${userId._id}/email-verification" >Verify email</a>`,
    };
    nodeMailer.sendMail(mailOptions);

    req.flash('message', `Sign up successfully, ${bodyData.firstName}`);
    req.flash('className','success');
    res.redirect("/signin");
  } catch (error) {
    res.redirect("/signin");
  }
});

/* Sign in */
router.get("/signin", (req, res, next) => {
  try {
    res.render("signin/index", { layout: "auth", title: "sign in" ,className:req.flash('className'), message: req.flash('message') });
  } catch (error) {
    console.log("error =>", error);
    res.render("error", { message: error });
  }
});

router.post("/signin", async (req, res, next) => {
  try {
    passport.authenticate("local", function (err, user, info) {
      console.log("--------- inside authenticate ----------");

      // error
      if (err) {
        console.log("err =>", err);
        req.flash('message', `${err}`);
        return next(err);
      }
      // user not found
      if (!user) {
        console.log("-------- user not found ---------");
        req.flash('message', 'Please enter valid Credentials');
        return res.redirect("/signin");
      }
      // user found successfully
      req.logIn(user, function (err) {
        if (err) return next(err);

        console.log("-----login success------");
        req.flash('message', 'Login Successfully...');
        
        // store user details in locals
        console.log("locals =>", res.locals.user);
        res.redirect("/");
        console.log("user => ", req.user);
      });
    })(req, res, next);
  } catch (error) {
    res.redirect("/signin");
  }
});

/* Logout Post */
router.get("/logout/", async (req, res, next) => {
  try {
    console.log("logout");
    await req.logout();
    return res.redirect("/");
  } catch (error) {
    console.log("error =>", error);
    res.redirect("/signin");
  }
});

module.exports = router;
