const User = require("../models/user");

module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    } else {
      req.flash("error", "Please login/register to continue");
      return res.redirect("/users/login");
    }
  },
  userInfo: (req, res, next) => {
    let userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, (err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.user = user;
        return next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      return next();
    }
  },
};
