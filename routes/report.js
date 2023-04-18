var express = require('express');
var router = express.Router();

/* Repoart */
router.get('/', function (req, res, next) {
    try {
        res.render("report/index", { title: "report" })
    } catch (error) {
        res.render("error", { message: error })
    }
});

module.exports = router;