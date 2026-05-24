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

/* =========================
   ✅ ADDED ONLY BELOW
   ========================= */

// auth routes (LOGIN + SIGNUP)
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// optional: session debug (you can remove later)
app.get("/me", (req, res) => {
  res.json(req.session.user || null);
});

// protect middleware (optional but useful)
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
}

// example protected route wrapper (NOT changing your existing routes)
app.use('/challenges', challengeRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const instructorRoutes = require('./routes/instructor');
app.use('/instructor', instructorRoutes);