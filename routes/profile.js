const express = require("express");
const router = express.Router();
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { usersModel } = require("../model/users");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = "public/uploads/profilePicture/";
    if (!fs.existsSync(path)) {
      path = fs.mkdirSync("public/uploads/profilePicture/", {
        recursive: true,
      });
    }
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${req.user.firstName}-${req.user._id}`;
    cb(null, fileName + fileExt);
  },
});
const upload = multer({ storage: storage });

/* Profile */
router.get("/", async (req, res, next) => {
  try {
    const userDetails = await usersModel.findOne(
      {
        _id: req.user._id,
      },
      {
        "firstName" : 1,
        "lastName" : 1,
        "gender" : 1,
        "email" : 1,
        "isVerify":1,
        "verificationDate":1,
        "totalVerifyLinkSend":1,
        "profilePicture": 1
      }
    ).lean();
    console.log("userDetails =>", userDetails);

    // remaining verification attempts (max 5 attempt)
    console.log("limit", Number(process.env.LINK_LIMIT));
    const remainingVerifyAttempts = Number(process.env.LINK_LIMIT) - userDetails.totalVerifyLinkSend; 

    res.render("profile/index", { title: "profile", user : userDetails,  remainingVerifyAttempts: remainingVerifyAttempts });
  } catch (error) {
    res.render("error", { message: error });
  }
});

/* update profile */
router.post("/", upload.single("profilePicture"), async (req, res, next) => {
  try {
    const bodyData = req.body;

    // when update profile photo 
    if (req.file) {
      const file = req.file;
      const fileNewName = req.file.path.split("/");
      const fileType = req.file.originalname.split(".");

      bodyData["profilePicture"] = {
        name: fileNewName[fileNewName.length - 1],
        originalName: req.file.originalname,
        fileType: fileType[1],
        path: req.file.path,
      };
    }

    console.log("bodyData =>", bodyData);
    // return console.log("file =>", file);
    // update user schema
    await usersModel.updateOne({ _id: req.user._id }, { $set: bodyData });
    // req.flash("info", "profile update successfully..");
    res.redirect("/profile");
  } catch (error) {
    res.render("error", { message: error });
  }
});

module.exports = router;
