const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

//  options for notification
const options = {
    timestamps: {
        createdOn: "createdOn",
        updatedOn: "updatedOn",
    },
    collation: {
        locale: "en"  // define English language
    }
};

const notificationSchema = new mongoose.Schema({
    receiverUserId:{
        type:ObjectId,
        require: true,
        ref: "users"
    },
    savedBy:{
        type:ObjectId,
        require: true,
        ref: "users"
    },
    isSeen:{
        type:Boolean,
        default:false
    },
    readOn:{
        type: Date
    },
    notificationType:{
        type:String
    },
},options);

const notificationModel = mongoose.model("notifications", notificationSchema);

module.exports = { notificationModel };