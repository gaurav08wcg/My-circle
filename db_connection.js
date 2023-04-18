const mongoose = require("mongoose");
require("dotenv").config();

module.exports = async function (url) {
    mongoose.connect(url)
        .then(() => console.log("database sucessfully conntected..."))
        .catch((error) => console.log("error =>", error))
}