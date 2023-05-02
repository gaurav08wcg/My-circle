const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

//  options for post
const options = {
    timestamps: {
        createdOn: "createdOn",
        updatedOn: "updatedOn",
    },
    collation: {
        locale: "en"  // define English language
    }
};

const commentSchema  = new mongoose.Schema({
    postId: {
        type: ObjectId,
        require: true,
        ref: "posts"
    },
    commentBy: {
        type: ObjectId,
        require: true,
        ref: "users"
    },
    commentText : {
        type: String,
        require: true
    }
},options);

const commentModel = mongoose.model("comment",commentSchema);

module.exports = { commentModel };