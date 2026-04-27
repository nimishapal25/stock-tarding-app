const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is required"],
  },
  email: {
    type: String,
    unique: [true, "Email should be unique"],
    required: [true, "Email is required"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    unique: [true, "Mobile number should be unique"],
    required: [true, "Mobile Number is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This will only work on SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
});

//pre save middlerware function, so the encyrption is gonna happen between the moment we recieve the data and the moment where it actually persisted to the database
//It runs between getting the data and saving it to the middleware
userSchema.pre("save", async function () {
  //Only run this when password is modified
  if (!this.isModified("password")) return;

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete the passwordconfirm field
  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
