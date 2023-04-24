var express = require('express');
var router = express.Router();
const { postModel } = require("../model/post");
const ObjectId = require("mongoose").Types.ObjectId;

router.get("/", async(req,res,next) =>{
try {
    
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

    const archivedPosts = await postModel.aggregate(pipeline);
    console.log("archivedPosts =>", archivedPosts);

    res.render("archived-post/index", { 
        title: "archived post",
        archivedPosts: archivedPosts,
        totalPosts: archivedPosts.length
    })
} catch (error) {
    res.render("error", { message : error })
}
});

module.exports= router;
