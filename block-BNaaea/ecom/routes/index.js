var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  let msg = req.flash("error");
  res.render("index", { msg, session: req.session.userId });
});

module.exports = router;
