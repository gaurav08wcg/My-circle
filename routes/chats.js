const express = require("express");
const router = express.Router();
const { usersModel } =  require("../model/users");

router.get("/", async (req,res, next) =>{
    try {
        const usersChat = await usersModel.find({ _id : { $ne: req.user._id } },
        {
            firstName:1,
            lastName:1,
            profilePicture: "$profilePicture.name"
        }).sort({
            firstName: 1
        }).lean();
        
        res.render("chats/index", { title:"chats", usersChat: usersChat });        
    } catch (error) {
        res.render("error", { error: error })
    }
})

module.exports = router;