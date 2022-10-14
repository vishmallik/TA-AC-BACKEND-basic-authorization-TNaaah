const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
