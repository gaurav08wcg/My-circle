var express = require('express');
var router = express.Router();
const { usersModel } = require("../model/users");

/* Users. */
router.get('/', async function (req, res, next) {
  try {

    // pagination variables 
    const limit = 3;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
  
    const pipeline =[];
    let sortBy ="createdAt";
    let sortOrder = -1;

    // add full name field in user's document 
    pipeline.push({
      $addFields: { 
        fullName: { $concat : [ "$firstName", " ", "$lastName" ]}
      }
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
          let: { userId: "$_id" },
          pipeline:[
            {
                $match: {
                    $expr: {
                         $eq: ["$$userId", "$postBy"] 
                    },
                    "isArchived" : false,
                }
            }
          ],
          as: "createPost"
        }
      }
    );

    // all user without skip limit
    const allUserList = await usersModel.aggregate(pipeline)
    // count of total user (without skip limit)
    const totalUsers = allUserList.length;

    // project
    pipeline.push(
      {
        $project: {
          firstName: 1,
          lastName: 1,
          fullName:1,
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

    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    )
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
    
    
    res.render("users/index", 
      { 
        title: "users", 
        usersList: usersList, 
        totalUsers: totalUsers, 
        search: req.query.search,
        pages: pages,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      }
    )
  } catch (error) {
    res.render("error", { message: error })
  }
});

module.exports = router;
