var express = require('express');
var router = express.Router();

/* create Post */
router.get('/', function (req, res, next) {
    try {
        res.render("post/index", { title: "create post" })
    } catch (error) {
        res.render("error", { message: error })
    }
});

module.exports = router;