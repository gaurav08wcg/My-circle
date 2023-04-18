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
    }
  },
  options
);

const usersModel = mongoose.model("users",usersSchema);

module.exports = { usersModel };