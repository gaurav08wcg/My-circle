const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

//  options for chat
const options = {
    timestamps: {
        createdOn: "createdOn",
        updatedOn: "updatedOn",
    },
    collation: {
        locale: "en"  // define English language
    }
};

const chatSchema  = new mongoose.Schema({
    sendBy: {
        type: ObjectId,
        require: true,
        ref: "users"
    },
    receiveBy: {
        type: ObjectId,
        require: true,
        ref: "users"
    },
    chatMessage : {
        type: String,
        require: true
    }
},options);

const chatsModel = mongoose.model("chats",chatSchema);

module.exports = { chatsModel };