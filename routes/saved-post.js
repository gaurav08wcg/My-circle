var express = require('express');
var router = express.Router();

/* Saved Posts */
router.get('/', function (req, res, next) {
    try {
        res.render("saved-post/index", { title: "saved-posts" })
    } catch (error) {
        res.render("error", { message: error })
    }
});

module.exports = router;