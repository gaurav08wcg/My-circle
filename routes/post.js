const express = require('express');
const router = express.Router();

const { postModel } = require("../model/post");

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

module.exports = router;