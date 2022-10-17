const express = require("express");
const User = require("../models/user");
const Article = require("../models/article");
const router = express.Router();

router.get("/login", (req, res, next) => {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("login", { error, success });
});

router.get("/register", (req, res, next) => {
  let error = req.flash("error");
  res.render("register", { error });
});

router.post("/register", (req, res, next) => {
  let { email } = req.body;
  if (!email) {
    req.flash("error", "email/password cannot be left blank");
    return res.redirect("/users/register");
  }
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash("error", "Email is already registered");
        return res.redirect("/users/register");
      }
      if (err.name === "ValidationError") {
        req.flash("error", "Password should be minimum 5 characters long");
        return res.redirect("/users/register");
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
    req.flash("error", "email/password cannot be left blank");
    return res.redirect("/users/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "User email not found. Please Register");
      return res.redirect("/users/login");
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("error", "Email/Password Combination doesn't match");
        return res.redirect("/users/login");
      }
      req.session.userId = user.id;
      Article.find({}, (err, articles) => {
        if (err) return next(err);
        return res.render("article", { articles });
      });
    });
  });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  return res.redirect("/");
});

module.exports = router;
