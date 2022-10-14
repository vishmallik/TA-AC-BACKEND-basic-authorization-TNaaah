const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, match: /@/, required: true },
    password: { type: String, required: true, minlength: 5 },
    type: { type: String, enum: ["Free", "VIP", "Premium"], default: "Free" },
    admin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
