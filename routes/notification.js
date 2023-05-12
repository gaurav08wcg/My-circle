const express = require("express");
const router= express.Router();
const { notificationModel } = require("../model/notifications");
const ObjectId = require("mongoose").Types.ObjectId;

/* List all notifications */
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
        // console.log("notificationList =>", notificationList);
        res.render("partials/notification-block",{ notifications : notificationList })
    } catch (error) {
        res.render("error", { error: error });
    }
});

/* render notification icon with total count of un seen notifications */
router.get("/count", async(req,res,next) =>{
  try {
      // un seen notification count
      const notificationCount = await notificationModel.count( {receiverUserId: new ObjectId(req.user._id), isSeen: false});
      
      res.render("partials/notification-list", { notificationCount: notificationCount });

  } catch (error) {
    res.render("error", { error: error })
  }
});

/* seen notification */
router.put("/:notificationId/seen", async (req,res,next) =>{
  try {
    
    // check notification is exist
    const isNotificationExist = await notificationModel.count( { receiverUserId: req.user._id, _id: req.params.notificationId });

    if(!isNotificationExist){
      return res.send({
        type: "error",
        message: "notification not exist"
      });
    }
    
    // seen true notification
    await notificationModel.updateOne( { _id: req.params.notificationId }, { isSeen: true } );
    res.send({
      type: "success",
      message: "Seen"
    });
  } catch (error) {
    res.render("error", { error : error });
  }
})
module.exports = router;