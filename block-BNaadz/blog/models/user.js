const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: String,
    email: { type: String, required: true, unique: true, match: /@/ },
    password: { type: String, required: true, minlength: 5 },
    city: String,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    return next();
  }
});

userSchema.methods.fullName = function () {
  return this.firstname + " " + this.lastname;
};

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    if (err) return next(err);
    return cb(err, result);
  });
};

module.exports = mongoose.model("User", userSchema);
