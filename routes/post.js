const express = require('express');
const router = express.Router();
const ObjectId = require("mongoose").Types.ObjectId;

const { postModel } = require("../model/post");
const { commentModel } = require("../model/comment");
const { savedPostModel } = require("../model/saved-post");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

// create storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = "public/uploads/posts/";
    if (!fs.existsSync(path)) {
      path = fs.mkdirSync("public/uploads/posts/", {
        recursive: true,
      });
    }
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = `post-${Date.now()}`;
    cb(null, fileName + fileExt);
  },
});
const upload = multer({ storage: storage });

/* create Post */
router.get('/', function (req, res, next) {
    try {
        res.render("post/index", { title: "create post" })
    } catch (error) {
        res.render("error", { message: error })
    }
});


router.post("/add",upload.single("postImage"), async (req,res,post)=>{
    try {
        
        const bodyData = req.body;
        const fileNewName = req.file.path.split("/");

        // set post by
        bodyData["postBy"] = req.user._id;

        // set post Image
        bodyData["postImage"] ={
            name:fileNewName[fileNewName.length - 1],
            path: req.file.path
        }

        // create post 
        await postModel.create(bodyData);

        req.flash("info", "profile update successfully..");
        // res.render("post/index", { messages: "create post successfully...." })
        res.redirect("/")
    } catch (error) {
        res.render("error", { message: error })
    }
})

/* edit */
router.get("/edit/:id", async (req,res,next) =>{
  try {
    // console.log("edit =>", req.params);

    const postOldDetails =  await postModel.findOne({ _id: req.params?.id }).lean();
  
    res.render("partials/edit-post-modal", { postOldDetails : postOldDetails, layout:"blank" })
  } catch (error) {
    res.render("error", { message: error })
  }
});


router.post("/edit/:id", upload.single("postImage"),async (req,res,next) => {
    try {
      console.log("req.body =>", req.body);
      console.log("req.file =>", req.file);
      console.log()
      const bodyData = req.body;

      // if update image
      if(req.file){
        const fileNewName = req.file.path.split("/");
        bodyData["postImage"] ={
          name:fileNewName[fileNewName.length - 1],
          path: req.file.path
        }
      }

      // update post
      await postModel.updateOne({_id:req.params.id}, { $set: bodyData });
      
      res.redirect("/");

    } catch (error) {
      res.render("error", { message: error })
    }  
})

/* archive */
router.put("/archive/:id", async (req,res,next) =>{
  try {
    console.log(req.params);

    const isArchived = await postModel.count({ _id: req.params.id, isArchived: true });
    console.log("archived =>", isArchived);
    // if already archive
    if(isArchived){
      return res.send({"type" : "success", "message": "already archived"})
      // await postModel.updateOne({ _id: req.params.id }, { $set:{ isArchived: false } });
      // return res.redirect("/");
    }

    // set archived true
    await postModel.updateOne({ _id: req.params.id }, { $set:{ isArchived: true } });
    return res.send({"type" : "success", "message": "post archived"})
    // res.redirect("/");

  } catch (error) {
    res.render("error", { message: error })    
  }
});

/* unArchive */
router.put("/unarchive/:id", async (req, res, next) =>{
  try {
    
    // check archived or not
    const isArchived = await postModel.count({ _id: req.params.id, isArchived: true });

    // if post is not archive then send message
    if(!isArchived){
      return res.send({"type":"success", "message": "this post is not archived"})
    }

    // unarchive post
    await postModel.updateOne({ _id: req.params.id }, { $set:{ isArchived: false } });    
    return res.send({"type" : "success", "message": "post unarchive"})

  } catch (error) {
    res.render("error", { error : error })
  }
}); 

/* view post & comment */
router.get("/view/:postId", async (req,res,next) =>{
try {
  console.log("postId =>", req.params);
  let postSaved, postOwner;

  const pipeline = [];
  const match = {
    $match: {
      _id: new ObjectId(req.params.postId),
    },
  };

  pipeline.push(match);

  // lookup 1
  pipeline.push({
    $lookup: {
      from: "users",
      let: { postBy: "$postBy" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$$postBy", "$_id"],
            },
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            gender: 1,
            email: 1,
          },
        },
      ],
      as: "postUserDetails",
    },
  });

  // lookup 2
  pipeline.push({
    $lookup: {
      from: "comments",
      let: { postId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$$postId", "$postId"],
            },
          },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
          $lookup: {
            from: "users",
            let: { commentBy: "$commentBy" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$commentBy", "$_id"],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                },
              },
            ],
            as: "commentedUser",
          },
        },
        {
          $project: {
            commentText: 1,
            createdAt: 1,
            commentBy: 1,
            commentedUser: { $arrayElemAt: ["$commentedUser", 0] },
          },
        },
      ],
      as: "comments",
    },
  });

  // project
  pipeline.push({
    $project: {
      title: 1,
      description: 1,
      postBy: 1,
      postImage: "$postImage.name",
      createdAt: 1,
      isArchived: 1,
      postUserInfo: { $arrayElemAt: ["$postUserDetails", 0] },
      comments: 1,
    },
  });

  const postDetails = await postModel.aggregate(pipeline);
  console.log("postDetails =>", postDetails[0]);

  // check post is mine or not
  postDetails[0].postBy == req.user._id ? postOwner= true : postOwner= false;

  // check post is saved or not 
  await savedPostModel.count({ postId:req.params.postId, savedBy: req.user._id }) == 1 ? postSaved = true : postSaved = false ;

  res.render("post/view-post", { 
      title : "view post", 
      postDetails: postDetails[0],
      postOwner:postOwner,
      postSaved: postSaved
  })
} catch (error) {
  res.render("error", { message: error });
}
});

/* add comment in post */
router.post("/add-comment/:postId", async (req,res,next) => {
  try {
    // find the post
    const findPost = await postModel.count({_id: req.params.postId, isArchived: false})

    // when post not found then show error
    if(!findPost){
      return res.send({
        type: "error",
        message: "Post is not found"
      });
    }

    const bodyData = req.body;
    bodyData["commentBy"] = req.user._id;
    bodyData["postId"] = req.params.postId
  
    // add comment
    await commentModel.create(bodyData);
    res.send({
      type: "success",
      message: "Comment Added"
    });
  } catch (error) {
    res.render("error", { message : error })
  }
})

/* delete comment from the post  */
router.post("/delete-comment/:commentId", async (req,res,next)=>{
  try {
    // console.log("commentId", req.params);
    const findComment = await commentModel.count({_id: req.params.commentId});
    
    // when comment not found then show error
    if(!findComment){
      return res.send({
        type:"error",
        message: "Comment not found"
      })
    }

    // delete comment 
    await commentModel.deleteOne({_id: req.params.commentId});

    res.send({
      type:"success",
      message: "Comment deleted"
    })
  } catch (error) {
    res.render("error", { message: error });
  }
})

module.exports = router;
