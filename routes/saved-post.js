var express = require('express');
var router = express.Router();
const { savedPostModel } =require("../model/saved-post");
const ObjectId = require("mongoose").Types.ObjectId;

/* show Saved Posts */
router.get('/', async function (req, res, next) {
    try {
        const pipeline =[];
        const match = { $match: { savedBy: new ObjectId(req.user._id) } };
        pipeline.push(match);

        // STAGE 1 - lookup saved_post -> post
        pipeline.push(
            {
                $lookup: {
                  from: "posts",
                  localField: "postId",
                  foreignField: "_id",
                  as: "saved_post"
                }
            }
        );

        // STAGE 2 - access 1st element of lookup output
        pipeline.push(
            {
                $project:{
                    postDetails: { $first: "$saved_post" }
                }
            }
        );

        // STAGE 3 - lookup postsDetails -> user
        pipeline.push(
            {
                $lookup:{
                    from:"users",
                    localField:"postDetails.postBy",
                    foreignField:"_id",
                    as:"postBy"
                }
            }
        ); 

        // STAGE 4 - project final output
        pipeline.push(
            {
                $project: {
                    postDetails:1,
                    posted_user_info: { $first: "$postBy" }
                }
            }
        );
        console.log("pipeline =>", pipeline);

        const savedPosts = await savedPostModel.aggregate(pipeline);   
        console.log("savedPosts =>", savedPosts);

        res.render("saved-post/index", { title: "saved-posts", savedPosts:savedPosts  })
    } catch (error) {
        res.render("error", { message: error })
    }
});

/* save the post */
router.post("/:id", async (req,res, next) =>{
    try {
        console.log("id =>", req.params);
        
        const alreadySaved = await savedPostModel.findOne({postId: req.params.id, savedBy: req.user._id});
        console.log("alreadySaved =>", alreadySaved);
        // if already saved
        if (alreadySaved) {
            return res.send(false);
        }

        await savedPostModel.create({postId: req.params.id, savedBy: req.user._id});

        res.send(true);

    } catch (error) {
        res.render("error", { message: error })
    }
});

module.exports = router;