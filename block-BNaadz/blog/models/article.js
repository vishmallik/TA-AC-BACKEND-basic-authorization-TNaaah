const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugger = require("slugger");

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    slug: String,
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  this.slug = slugger(this.title);
  next();
});

module.exports = mongoose.model("Article", articleSchema);
