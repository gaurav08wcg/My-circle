var express = require('express');
var router = express.Router();
const { savedPostModel } = require("../model/saved-post");
const { notificationModel } = require("../model/notifications");
const ObjectId = require("mongoose").Types.ObjectId;

/* show Saved Posts */
router.get('/', async function (req, res, next) {
    try {

        // pagination variables 
        const limit = 3;
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

        // when click un save button
        if(req.query.unSave) await savedPostModel.deleteOne({postId: new ObjectId(req.query.postId)}) ;

        const pipeline = [];
        const match = { $match: { savedBy: new ObjectId(req.user._id) } };
        pipeline.push(match);

        /* ========= lookup with posts ============ */
        pipeline.push({
          $lookup: {
            from: "posts",
            let: { postId: "$postId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$postId"],
                  },
                },
              },
              {
                $project: {
                  title: 1,
                  description: 1,
                  postImage: "$postImage.name",
                  createdAt: 1,
                  postBy: 1,
                },
              },
            ],
            as: "postDetails",
          },
        });

        /* ========= lookup with users ============ */
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
                  profilePicture:"$profilePicture.name"
                },
              },
            ],
            as: "postBy",
          },
        });

        /* ========= lookup with comments ============ */
        pipeline.push({
          $lookup: {
            from: "comments",
            let: { postId: "$postId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$postId", "$$postId"],
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


        /* ========= project all data ============ */
        pipeline.push({
            $project: {
                postDetails: { $arrayElemAt: ["$postDetails", 0] },
                totalComments: { $arrayElemAt : [ "$comments.total", 0] },
                postBy : { $arrayElemAt : [ "$postBy", 0] },
            }
        })


        // STAGE 1 - lookup saved_post -> post
        // pipeline.push(
        //     {
        //         $lookup: {
        //             from: "posts",
        //             localField: "postId",
        //             foreignField: "_id",
        //             as: "saved_post"
        //         }
        //     }
        // );

        // STAGE 2 - access 1st element of lookup output
        // pipeline.push(
        //     {
        //         $project: {
        //             postDetails: { $first: "$saved_post" }
        //         }
        //     }
        // );

        // STAGE 3 - lookup postsDetails -> user
        // pipeline.push(
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "postDetails.postBy",
        //             foreignField: "_id",
        //             as: "postBy"
        //         }
        //     }
        // );

        // STAGE 4 - project final output
        // pipeline.push(
        //     {
        //         $project: {
        //             postDetails: 1,
        //             posted_user_info: { $first: "$postBy" }
        //         }
        //     }
        // );

        // stage 5 - skip limit for pagination
        pipeline.push(
            { $skip: skip },
            { $limit: limit }
        )
        // console.log("pipeline =>", pipeline);
        
        // list of all saved post
        const savedPosts = await savedPostModel.aggregate(pipeline);
        console.log("savedPosts =>", savedPosts);
        
        // total count of saved post
        const totalSavedPostCount = await savedPostModel.count({savedBy: new ObjectId(req.user._id)});
        console.log("totalSavedPostCount =>", totalSavedPostCount);
        
        // total no of pages
        const pages = [];
        for (let i = 1; i <= Math.ceil(totalSavedPostCount / limit); i++) {
            pages.push(i);
        }

        res.render("saved-post/index", 
            { 
                title: "saved-posts", 
                totalPosts: totalSavedPostCount, 
                savedPosts: savedPosts,
                pages: pages,
                totalPages: Math.ceil(totalSavedPostCount / limit),
                currentPage: page, 
            }
        )
    } catch (error) {
        res.render("error", { message: error })
    }
});

/* save the post */
router.post("/:id", async (req, res, next) => {
    try {
        console.log("id =>", req.params);
        const postBy = req.query.postBy;

        const alreadySaved = await savedPostModel.findOne({ postId: req.params.id, savedBy: req.user._id });
        console.log("alreadySaved =>", alreadySaved);
        // if already saved
        if (alreadySaved) { 
            await savedPostModel.deleteOne({ postId: req.params.id, savedBy: req.user._id });
            return res.send("post unsaved");
        }

        // save post query 
        await savedPostModel.create({ postId: req.params.id, savedBy: req.user._id, postBy : req.query.postBy  });

        // send notification
        const notificationObject = {};
        notificationObject["receiverUserId"] = req.query.postBy;
        notificationObject["savedBy"] = req.user._id;
        notificationObject["notificationType"] = "save post";
        await notificationModel.create(notificationObject);

        // emit notification to post owner 
        io.to(req.query.postBy).emit("notify", `your post saved By ${req.user.firstName} ${req.user.lastName}`);

        res.send("post saved");

    } catch (error) {
        res.render("error", { message: error })
    }
});


module.exports = router;