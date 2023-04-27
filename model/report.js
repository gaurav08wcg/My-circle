const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;


//  options for users
const options = {
    timestamps: {
        createdOn: "createdOn",
        updatedOn: "updatedOn",
    },
    collation: {
        locale: "en"  // define English language
    }
};

const reportSchema = new mongoose.Schema({
    userId:{
        type: ObjectId,
        require: true,
        ref:"user"
    },
    fullName: {
        type: String
    },
    totalCreatedPost:{
        type:Number
    },
    totalSavedPost:{
        type: Number
    },
    totalSavedByOther:{
        type: Number
    }
},options);

const reportModel = mongoose.model("report", reportSchema);

module.exports = { reportModel };