const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  //reading the data we saved there
  // res.send(req.user);

  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  //console.log(user);
  res.render("profile", { user });
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  //post.likes.indexOf(req.user.userid) will give the index and splice will remove it, 1 tells how many to remove
  await post.save();
  res.redirect("/profile");
});

app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    //date is default
    content: content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.post("/register", async (req, res) => {
  let { name, username, password, age, email } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhh");
      res.cookie("token", token);
      res.send("Registered!");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong!");

  //password matching

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

//middleware for protected route- profile
function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.redirect("/login");
  } else {
    try {
      let data = jwt.verify(token, "shhh");
      req.user = data;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.redirect("/login");
    }
  }
}

app.listen(3300);
