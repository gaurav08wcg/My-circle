const mongoose = require("mongoose");

//  options for users
const options = {
  timestamps: {
    createdOn: "createdOn",
    updatedOn: "updatedOn",
  },
};

// user Schema
const usersSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    gender:{
      type:String,
      require:true
    },
    email: {
      type:String,
      require: true,
      unique: true,
      lowercase:true
    },
    password:{
      type:String,
      require: true
    },
    profilePicture:{
      name:{
        type: String
      },
      originalName:{
        type: String
      },
      fileType:{
        type:String
      },
      path:{
        type:String
      },
    },
    isVerify: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date      
    },
    lastVerifyLinkSend: {
      type: Date,
      default: new Date()
    },
    totalVerifyLinkSend:{
      type:Number,
      default: 0
    } 
  },
  options
);

const usersModel = mongoose.model("users",usersSchema);

module.exports = { usersModel };