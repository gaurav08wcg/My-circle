const express = require("express");
const router = express.Router();
const ObjectId = require("mongoose").Types.ObjectId;
const { usersModel } = require("../model/users");
const { chatsModel } = require("../model/chats");

/* chat page (list all chats)*/
router.get("/", async (req, res, next) => {
    try {

        const usersChat = await usersModel.find({ _id: { $ne: req.user._id } },
            {
                firstName: 1,
                lastName: 1,
                profilePicture: "$profilePicture.name"
            }).sort({
                firstName: 1
            }).lean();

        // when user click on particulars chat
        // if(req.params.oppositeUserId){

        //     // oppositeUser info
        //     const userInfo = await usersModel.findOne({ _id: req.params.oppositeUserId }, { firstName: 1, lastName: 1, profilePicture: "$profilePicture.name"}).lean();

        //     // list the both chat's conversation
        //     const pipeline = [];
        //     // match
        //     const match = {
        //         $match:{
        //             $or:[
        //               { $and:[ {sendBy:new ObjectId(req.user._id)}, { receiveBy:new ObjectId(req.params.oppositeUserId) } ] },
        //               { $and:[ {sendBy:new ObjectId(req.params.oppositeUserId)}, { receiveBy:new ObjectId(req.user._id) } ] }
        //             ]
        //         }
        //     };
        //     pipeline.push(match);

        //     // project
        //     pipeline.push({
        //         $project:{
        //             sendBy:1,
        //             receiveBy:1,
        //             chatMessage:1,
        //             createdAt:1,
        //             updatedAt:1
        //         }
        //     });
        //     const listOfChats = await chatsModel.aggregate(pipeline);



        //     return res.render("chats/index", { title: "chats", usersChat: usersChat, userInfo:userInfo , listOfChats: listOfChats});
        // }

        res.render("chats/index", { title: "chats", usersChat: usersChat });
    } catch (error) {
        res.render("error", { error: error })
    }
})

/* Open Single chat (view chat) */
router.get("/:oppositeUserId", async (req, res, next) => {
    try {
        // find all chat's 
        const usersChat = await usersModel
            .find(
                { _id: { $ne: req.user._id } },
                {
                    firstName: 1,
                    lastName: 1,
                    profilePicture: "$profilePicture.name",
                }
            )
            .sort({
                firstName: 1,
            })
            .lean();

        // oppositeUser info
        const userInfo = await usersModel.findOne({ _id: req.params.oppositeUserId }, { firstName: 1, lastName: 1, profilePicture: "$profilePicture.name" }).lean();

        // list the both chat's conversation
        const pipeline = [];
        // match
        const match = {
            $match: {
                $or: [
                    { $and: [{ sendBy: new ObjectId(req.user._id) }, { receiveBy: new ObjectId(req.params.oppositeUserId) }] },
                    { $and: [{ sendBy: new ObjectId(req.params.oppositeUserId) }, { receiveBy: new ObjectId(req.user._id) }] }
                ]
            }
        };
        pipeline.push(match);

        // project
        pipeline.push({
            $project: {
                sendBy: 1,
                receiveBy: 1,
                chatMessage: 1,
                createdAt: 1,
                updatedAt: 1
            }
        });
        const listOfChats = await chatsModel.aggregate(pipeline);

        return res.render("chats/index", { title: "chats", usersChat: usersChat, userInfo: userInfo, listOfChats: listOfChats });
    } catch (error) {
        res.render("error", { error: error });
    }
})

/* send chat message */
router.post("/:receiverUserId/send-message", async (req, res, next) => {
    try {
        const isUser = await usersModel.findOne({ _id: req.params.receiverUserId });
        // when user not found
        if (!isUser) {
            return res.status(404).send({
                type: "error",
                message: "Something want's wrong"
            })
        }

        // add chat message
        await chatsModel.create({
            sendBy: req.user._id,
            receiveBy: req.params.receiverUserId,
            chatMessage: req.body.chatMessage
        })

        // send notification to receiver
        io.to(req.params.receiverUserId).emit("receiveMessage",
            {
                message: `Receive message by ${isUser.firstName}`,
                userId: req.user._id
            })

        res.send({
            type: "success",
            message: "message sended"
        })

    } catch (error) {
        res.render("error", { error: error });
    }
})

module.exports = router;