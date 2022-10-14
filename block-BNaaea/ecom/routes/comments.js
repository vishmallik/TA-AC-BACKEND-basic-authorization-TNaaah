const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Comment = require("../models/comment");
const auth = require("../middlewares/auth");

router.use(auth.isLoggedIn);

router.get("/:commentId/edit", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findById(commentId, (err, comment) => {
    if (err) return next(err);
    res.render("editComment", { comment });
  });
});

router.get("/:commentId/delete", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findByIdAndDelete(commentId, (err, comment) => {
    if (err) return next(err);
    Product.findByIdAndUpdate(
      comment.productId,
      { $pull: { comments: comment.id } },
      (err, product) => {
        if (err) return next(err);
        res.redirect("/products/" + product.id);
      }
    );
  });
});

router.post("/:commentId", (req, res, next) => {
  let commentId = req.params.commentId;
  Comment.findByIdAndUpdate(commentId, req.body, (err, comment) => {
    if (err) return next(err);
    Product.findById(comment.productId, (err, product) => {
      if (err) return next(err);
      res.redirect("/products/" + product.id);
    });
  });
});

module.exports = router;
