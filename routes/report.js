var express = require("express");
var router = express.Router();
const { reportModel } = require("../model/report")
const ObjectId = require("mongoose").Types.ObjectId;
// const { usersModel } = require("../model/users");
// const { postModel } = require("../model/post");
// const { savedPostModel } = require("../model/saved-post");

/* Repoart */
router.get("/", async function (req, res, next) {
  try {
    const usersReport = await reportModel.find().lean();
    console.log("userReport", usersReport);

    res.render("report/index", {
      title: "report",
      usersReport:usersReport
    });
  } catch (error) {
    res.render("error", { message: error });
  }
});

module.exports = router;
