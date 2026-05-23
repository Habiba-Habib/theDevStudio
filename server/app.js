require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require('express-session'); // add this
const connectDB = require("./config/db");
const challengeRoutes = require('./routes/challenges');
const studentRoutes = require("./routes/studentRoutes");

const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({                   
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false
}));
app.use("/student", studentRoutes);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.use('/challenges', challengeRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});