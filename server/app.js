require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const app = express();


connectDB();
const User = require("./models/User");

app.get("/test-db", async (req, res) => {
  const user = await User.create({
    name: "Test User",
    email: "test@test.com",
    password: "1234"
  });

  res.send(user);
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});