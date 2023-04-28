const express = require('express');
const router = express.Router();

const { postModel } = require("../model/post");

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { log } = require('console');
const { route } = require('.');

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

module.exports = router;
