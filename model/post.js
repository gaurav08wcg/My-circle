const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

//  options for users
const options = {
    timestamps: {
      createdOn: "createdOn",
      updatedOn: "updatedOn",
    },
  }; 

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true        
    },
    postBy:{
        type: ObjectId,
        require:true,
        ref:"users"
    },
    savedBy:[
        {
            userId: {
                type:ObjectId,
                ref: "users"
            },
        }
    ],
    postImage:{
        name:{
            type: String
        },
        path:{
            type:String
        },
    },
    isArchived:{
        type: Boolean,
        default: false,
    }
},options);

const postModel = mongoose.model("post", postSchema);

module.exports = { postModel };
