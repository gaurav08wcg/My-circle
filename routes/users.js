var express = require('express');
var router = express.Router();
const { usersModel } = require("../model/users");

/* Users. */
router.get('/', async function (req, res, next) {
  try {

  
    const pipeline =[];
    let sortBy ="createdAt";
    let sortOrder = -1;

    // when search user
    if (req.query.search) {
      console.log("search =>", req.query.search);
      pipeline.push({
        $match: {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { fullName: { $regex: req.query.search, $options: "i" } } 
          ]
        },
      });
    }

    // when sort user
    if(req.query.sortOrder){
      console.log("req.query =>", req.query);
      sortOrder = Number(req.query.sortOrder);
    }

    // lookup 1
    pipeline.push(
      {
        $lookup: {
          from: "savedposts",
          localField: "_id",
          foreignField: "savedBy",
          as: "savedPost"
        }
      }
    );

    // lookup 2
    pipeline.push(
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "postBy",
          as: "createPost"
        }
      }
    );

    // project
    pipeline.push(
      {
        $project: {
          firstName: 1,
          lastName: 1,
          fullName : { $concat : [ "$firstName", " ", "$lastName" ] },
          gender: 1,
          email: 1,
          createdAt: 1,
          profilePicture: 1,
          totalSavedPost: { $size: "$savedPost" },
          totalCreatedPost: { $size: "$createPost" }
        }
      }
    );

    pipeline.push({
      $sort:{ [sortBy] : sortOrder }
    })
    console.log("pipeline =>", JSON.stringify(pipeline, null,2));

    const usersList = await usersModel.aggregate(pipeline)
    const totalUsers = usersList.length;
    console.log("usersList =>", usersList);
    console.log("totalUsers =>", totalUsers);
    
    // const usersList = await usersModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "savedposts",
    //       localField: "_id",
    //       foreignField: "savedBy",
    //       as: "savedPost"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "posts",
    //       localField: "_id",
    //       foreignField: "postBy",
    //       as: "createPost"
    //     }
    //   },
    //   {
    //     $project: {
    //       firstName: 1,
    //       lastName: 1,
    //       gender: 1,
    //       email: 1,
    //       createdAt: 1,
    //       profilePicture: 1,
    //       totalSavedPost: { $size: "$savedPost" },
    //       totalCreatedPost: { $size: "$createPost" }
    //     }
    //   }
    // ]);


    res.render("users/index", { title: "users", usersList: usersList, totalUsers: totalUsers })
  } catch (error) {
    res.render("error", { message: error })
  }
});

module.exports = router;
