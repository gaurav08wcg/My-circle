const express = require("express");
const router= express.Router();
const { notificationModel } = require("../model/notifications");
const ObjectId = require("mongoose").Types.ObjectId;

router.get("/", async (req,res,next) =>{
    try {
        let notificationList = await notificationModel.aggregate([
          {
            $match: {
              receiverUserId: new ObjectId(req.user._id),
              isSeen: false,
            },
          },
          {
            $lookup: {
              from: "users",
              let: { savedBy: "$savedBy" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$savedBy"],
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
              as: "savedUserName",
            },
          },
          {
            $project: {
              receiverUserId: 1,
              savedBy: 1,
              createdAt: 1,
              savedUserName: { $arrayElemAt: ["$savedUserName", 0] },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ]);
        
        res.render("partials/notification-block",{ notifications : notificationList })
    } catch (error) {
        res.render("error", { error: error });
    }
});

module.exports = router;