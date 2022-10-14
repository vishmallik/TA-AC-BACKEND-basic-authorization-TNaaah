const User = require("../models/user");
module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    } else {
      return res.redirect("/users/login");
    }
  },
  userData: (req, res, next) => {
    let userId = req.session && req.session.userId;
    User.findById(userId, "name", (err, user) => {
      if (err) return next(err);
      req.user = user;
      res.locals.user = user;
      next();
    });
  },
  isAdmin: (req, res, next) => {
    if (req.user.admin) {
      next();
    } else {
      return res.redirect("/users/login");
    }
  },
};
