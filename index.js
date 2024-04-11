const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load variables from .env
dotenv.config();

// Set up Mongo models and connection
const DB_NAME = "auth_lab";
const connection = mongoose.createConnection(
  `mongodb://localhost:27017/${DB_NAME}`
);
const User = connection.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
  })
);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    res.redirect("/");
    return;
  }

  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (err) {
      res.status(403).send("Access Denied");
    } else {
      res.redirect(`/dashboard/${user.username}`);
    }
  });
});

app.post("/signup", async (req, res) => {
  const saltRounds = process.env.SALT;
  const hash = await bcrypt.hash(req.body.password, Number(saltRounds));

  const user = new User({
    username: req.body.username,
    password: hash,
  });
  await user.save();

  res.redirect("/");
});

app.get("/dashboard/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.redirect("/");
    return;
  }
  res.send(`<h1>Hello ${user.username}</h1>`);
});

app.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});
