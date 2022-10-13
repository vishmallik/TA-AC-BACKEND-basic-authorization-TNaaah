const express = require("express");
const Comment = require("../models/comment");
const router = express.Router();
const Article = require("../models/article");
const auth = require("../middlewares/auth");
const { route } = require(".");

router.get("/", (req, res, next) => {
  Article.find({}, (err, articles) => {
    if (err) return next(err);
    return res.render("article", { articles });
  });
});

router.get("/:articleId", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOne({ slug: articleId })
    .populate("comments")
    .populate("author", "firstname lastname")
    .exec((err, article) => {
      if (err) return next(err);
      // if(req.user.id === article.author.id);
      Comment.find({ articleId: article.id })
        .populate("author", "firstname lastname")
        .exec((err, comments) => {
          if (err) return next(err);
          res.render("singleArticle", { article, comments });
        });
    });
});

router.use(auth.isLoggedIn);

router.get("/:articleId/inc", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOneAndUpdate(
    { slug: articleId },
    { $inc: { likes: 1 } },
    (err, article) => {
      if (err) return next(err);
      res.redirect("/articles/" + articleId);
    }
  );
});

router.get("/:articleId/dec", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOneAndUpdate(
    { slug: articleId },
    { $inc: { likes: -1 } },
    (err, article) => {
      if (err) return next(err);
      res.redirect("/articles/" + articleId);
    }
  );
});

router.get("/:articleId/edit", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOne({ slug: articleId }, (err, article) => {
    if (err) return next(err);
    if (req.user.id == article.author) {
      return res.render("editArticle", { article });
    } else {
      return res.redirect("/articles/" + articleId);
    }
  });
});

router.get("/:articleId/delete", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOne({ slug: articleId }, (err, article) => {
    if (err) return next(err);
    if (req.user.id == article.author) {
      Article.findByIdAndDelete(article.id, (err, deletedArticle) => {
        if (err) return next(err);
        Comment.deleteMany({ articleId: deletedArticle._id }, (err, result) => {
          if (err) return next(err);
          res.redirect("/articles");
        });
      });
    } else {
      return res.redirect("/articles/" + articleId);
    }
  });
});

router.post("/:articleId/comments", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOne({ slug: articleId }, (err, article) => {
    req.body.articleId = article._id;
    req.body.author = req.user;
    Comment.create(req.body, (err, comment) => {
      if (err) return next(err);
      Article.findOneAndUpdate(
        { slug: articleId },
        { $push: { comments: comment._id } },
        (err, article) => {
          if (err) return next(err);
          res.redirect("/articles/" + articleId);
        }
      );
    });
  });
});

router.post("/", (req, res, next) => {
  req.body.author = req.user;
  Article.create(req.body, (err, article) => {
    if (err) return next(err);
    return res.redirect("/articles");
  });
});

router.get("/users/:userId", (req, res, next) => {
  let userId = req.params.userId;
  console.log(userId);

  Article.find({ author: userId }, (err, articles) => {
    if (err) return next(err);
    return res.render("article", { articles });
  });
});

router.post("/:articleId", (req, res, next) => {
  let articleId = req.params.articleId;
  Article.findOne({ slug: articleId }, (err, article) => {
    if (err) return next(err);
    if (req.user.id == article.author) {
      Article.findByIdAndUpdate(article.id, req.body, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + articleId);
      });
    } else {
      res.redirect("/articles/" + articleId);
    }
  });
});

module.exports = router;
