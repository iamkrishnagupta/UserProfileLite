const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/min-project");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profile:{
    type: String,
    default : "def_profile.png"
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
