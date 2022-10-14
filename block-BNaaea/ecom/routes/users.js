const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require("../models/product");
const auth = require("../middlewares/auth");
const { route } = require("./products");

router.get("/login", function (req, res, next) {
  if (req.session.userId) {
    return res.redirect("/products");
  } else {
    let msg = req.flash("error");
    return res.render("login", { msg });
  }
});

router.post("/register", (req, res, next) => {
  if (req.session.userId) {
    req.session.destroy();
    res.clearCookie("connect.sid");
  }
  let { email } = req.body;
  if (!email) {
    req.flash("error", "Email/Password cannot be left blank");
    return res.redirect("/");
  }
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash("error", "User already registered with this email");
        return res.redirect("/");
      }
      if (err.name === "ValidationError") {
        req.flash("error", "Password should be minimum 5 characters long");
        return res.redirect("/");
      }
      return next(err);
    }
    req.flash(
      "success",
      "User successfully registered. Please login to continue"
    );
    return res.redirect("/users/login");
  });
});

router.post("/login", (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email/Password cannot be left blank");
    return res.redirect("/users/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "User email not found. Please Register");
      return res.redirect("/users/login");
    }
    if (user.isBlocked) {
      req.flash("error", "User id blocked. Please contact admin");
      return res.redirect("/users/login");
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("error", "Email/Password Combination doesn't match");
        return res.redirect("/users/login");
      }
      req.session.userId = user.id;
      return res.redirect("/products");
    });
  });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  return res.redirect("/");
});

router.use(auth.isLoggedIn);

router.get("/admin", (req, res, next) => {
  if (req.user.auth == "admin") {
    User.find({}, (err, users) => {
      if (err) return next(err);
      Product.find({}, (err, products) => {
        if (err) return next(err);
        let error = req.flash("err");
        let success = req.flash("success");
        res.render("adminDashboard", { users, products, error, success });
      });
    });
  } else {
    res.redirect("/");
  }
});
router.get("/block/:userId", (req, res, next) => {
  if (req.user.auth == "admin") {
    let userId = req.params.userId;
    User.findById(userId, (err, user) => {
      if (err) return next(err);
      if (user.auth == "admin") {
        req.flash("err", "You can't block an admin");
        res.redirect("/users/admin");
      } else {
        User.findByIdAndUpdate(
          userId,
          { $set: { isBlocked: true } },
          (err, user) => {
            if (err) return next(err);
            req.flash("success", "User blocked successfully");
            res.redirect("/users/admin");
          }
        );
      }
    });
  } else {
    res.redirect("/products");
  }
});
router.get("/unblock/:userId", (req, res, next) => {
  let userId = req.params.userId;
  if (req.user.auth == "admin") {
    User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: false } },
      (err, user) => {
        if (err) return next(err);
        req.flash("success", "User Un-blocked successfully");
        res.redirect("/users/admin");
      }
    );
  } else {
    res.redirect("/products");
  }
});

module.exports = router;
