const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const podcastSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    featuring: [{ type: String }],
    posted: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Podcast", podcastSchema);
