var express = require('express');
var router = express.Router();
const { usersModel } = require("../model/users");
const ObjectId = require("mongoose").Types.ObjectId;


/* Repoart */
router.get('/', async function (req, res, next) {
  try {

    const usersDetails = await usersModel.aggregate([
      {
        $lookup: {
          from: "posts",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$postBy", "$$userId"],
                },
              },
            },
          ],
          as: "createdPost",
        },
      },

      {
        $lookup: {
          from: "savedposts",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$savedBy"],
                },
              },
            },
          ],
          as: "savedPost",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          fullName: { $concat: ["$firstName", " ", "$lastName"] },
          profilePicture: {
            name: 1,
          },
          totalCreatedPost: { $size: "$createdPost" },
          totalSavedPost: { $size: "$savedPost" },
        },
      },
    ]);

    const savedPostByOthers = await usersModel.aggregate([
      {
        $lookup: {
          from: "posts",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and:
                    [
                      { $eq: ["$$userId", "$postBy"] },
                      { "isArchived": false }
                    ]
                }
              }
            },
            { $project: { "_id": 1 } },
            {
              $lookup: {
                from: "savedposts",
                localField: "_id",
                foreignField: "postId",
                as: "savedByOther"
              }
            },
            { $project: { totalSavedPost: { $size: "$savedByOther" } } },
            {
              $group: {
                _id: null,
                totalSavedPost: { $sum: "$totalSavedPost" }
              }
            }
          ],
          as: "users_posts"
        }
      },
      {
        $project: {
          total: "$users_posts.totalSavedPost"
        }
      }
    ]);

    console.log("usersDetails =>", JSON.stringify(usersDetails, null, 2));
    console.log("savedPostByOthers =>", JSON.stringify(savedPostByOthers, null, 2));


    res.render("report/index",
      {
        title: "report",
        usersDetails: usersDetails,
        savedPostByOthers: savedPostByOthers
      }
    )
  } catch (error) {
    res.render("error", { message: error })
  }
});

module.exports = router;