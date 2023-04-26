var express = require('express');
var router = express.Router();
const { postModel } = require("../model/post");
const ObjectId = require("mongoose").Types.ObjectId;

router.get("/", async(req,res,next) =>{
try {
  
    // pagination variables 
    const limit = 3;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // if click on unarchive btn
    if(req.query.archive) await postModel.updateOne({_id : new ObjectId(req.query.postId)}, { isArchived: false });
    
    const pipeline = [];
    const match = {
        $match: {
            postBy: new ObjectId(req.user._id), 
            isArchived: true,
        }
    };
    pipeline.push(match);
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "postBy",
        foreignField: "_id",
        as: "post_with_users",
      },
    });

    // total archive post without skip & limit
    const allArchivedPost =  await postModel.aggregate(pipeline);
    const totalArchivePost = allArchivedPost.length;

    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        postBy: 1,
        postBy: { $first: "$post_with_users" },
        postImage: "$postImage.name",
        createdAt: 1,
      },
    });
    pipeline.push({
      $sort: {
        "createdAd": -1
      }
    });
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    )

    const archivedPosts = await postModel.aggregate(pipeline);
    console.log("archivedPosts =>", archivedPosts);

    // total no of pages
    const pages = [];
    for (let i = 1; i <= Math.ceil(totalArchivePost / limit); i++) {
        pages.push(i);
    }




    res.render("archived-post/index", { 
        title: "archived post",
        archivedPosts: archivedPosts, // archived posts list with details  
        totalPosts: totalArchivePost, // total count of all archived post
        totalPages: Math.ceil(totalArchivePost / limit),  // total pages
        currentPage: page,  // current page
        pages: pages  // no of pages array
    })
} catch (error) {
    res.render("error", { message : error })
}
});

module.exports= router;
