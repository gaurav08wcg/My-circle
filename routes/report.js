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

        console.log("usersDetails =>", JSON.stringify(usersDetails));


        res.render("report/index", 
            { 
                title: "report", 
                usersDetails: usersDetails
            }
        )
    } catch (error) {
        res.render("error", { message: error })
    }
});

module.exports = router;