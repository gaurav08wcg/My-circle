const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

//  options for users
const options = {
    timestamps: {
      createdOn: "createdOn",
      updatedOn: "updatedOn",
    },
  }; 

const savedPostSchema = new mongoose.Schema({
    postId:{
        type: ObjectId,
        require: true,
        ref: "post"
    },
    savedBy: {
        type:ObjectId,
        require: true,
        ref: "users"
    },
},options);

const savedPostModel = mongoose.model("savedPost", savedPostSchema);

module.exports = { savedPostModel };