var express = require('express');
var router = express.Router();
const { usersModel } = require("../model/users");

/* Users. */
router.get('/', async function (req, res, next) {
  try {

    const usersList = await usersModel.aggregate([
      {
        $lookup: {
          from: "savedposts",
          localField: "_id",
          foreignField: "savedBy",
          as: "savedPost"
        }
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "postBy",
          as: "createPost"
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          gender: 1,
          email: 1,
          createdAt: 1,
          profilePicture: 1,
          totalSavedPost: { $size: "$savedPost" },
          totalCreatedPost: { $size: "$createPost" }
        }
      }
    ]);
    const totalUsers = usersList.length;

    console.log("usersList =>", usersList);
    console.log("totalUsers =>", totalUsers);

    res.render("users/index", { title: "users", usersList: usersList, totalUsers: totalUsers })
  } catch (error) {
    res.render("error", { message: error })
  }
});

module.exports = router;
