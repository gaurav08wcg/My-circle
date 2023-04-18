var express = require('express');
var router = express.Router();

/* Profile */
router.get('/', function (req, res, next) {
    try {
        res.render("profile/index", { title: "profile" })
    } catch (error) {
        res.render("error", { message: error })
    }
});

module.exports = router;
