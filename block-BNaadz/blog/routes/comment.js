const express = require("express");
const Comment = require("../models/comment");
const router = express.Router();
const Article = require("../models/article");
const auth = require("../middlewares/auth");

router.use(auth.isLoggedIn);
router.get("/:commentId/like", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likes: 1 } },
    (err, comment) => {
      if (err) return next(err);
      Article.findById(comment.articleId, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + article.slug);
      });
    }
  );
});

router.get("/:commentId/dislike", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likes: -1 } },
    (err, comment) => {
      if (err) return next(err);
      Article.findById(comment.articleId, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + article.slug);
      });
    }
  );
});

router.get("/:commentId/edit", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findById(commentId, (err, comment) => {
    if (err) return next(err);
    if (req.user.id == comment.author) {
      Article.findById(comment.articleId, (err, article) => {
        if (err) return next(err);
        res.render("editComment", { comment, article });
      });
    } else {
      Article.findById(comment.articleId, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + article.slug);
      });
    }
  });
});

router.get("/:commentId/delete", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findById(commentId, (err, comment) => {
    if (err) return next(err);
    if (req.user.id == comment.author) {
      Comment.findByIdAndDelete(comment.id, (err, deletedComment) => {
        if (err) return next(err);
        Article.findByIdAndUpdate(
          deletedComment.articleId,
          { $pull: { comments: deletedComment._id } },
          (err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + article.slug);
          }
        );
      });
    } else {
      Article.findById(comment.articleId, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + article.slug);
      });
    }
  });
});

router.post("/:commentId", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findById(commentId, (err, comment) => {
    if (err) return next(err);
    if (req.user.id == comment.author) {
      Comment.findByIdAndUpdate(comment.id, req.body, (err, comment) => {
        if (err) return next(err);
        Article.findById(comment.articleId, (err, article) => {
          if (err) return next(err);
          return res.redirect("/articles/" + article.slug);
        });
      });
    } else {
      Article.findById(comment.articleId, (err, article) => {
        if (err) return next(err);
        return res.redirect("/articles/" + article.slug);
      });
    }
  });
});

module.exports = router;
