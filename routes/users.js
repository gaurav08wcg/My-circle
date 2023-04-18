var express = require('express');
var router = express.Router();

/* Users. */
router.get('/', function (req, res, next) {
  try {
    res.render("users/index", { title: "users" })
  } catch (error) {
    res.render("error", { message: error })
  }
});

module.exports = router;
