require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "devstudiosecret",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "../public")));   //added

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const authRoutes       = require("./routes/authRoutes");
const studentRoutes    = require("./routes/studentRoutes");
const instructorRoutes = require("./routes/instructor");
const adminRoutes      = require("./routes/admin");
const challengeRoutes  = require("./routes/challenges");
const publicRoutes     = require("./routes/public");           //moved


app.use("/auth",       authRoutes);
app.use("/",           publicRoutes);
app.use("/student",    studentRoutes);
app.use("/instructor", instructorRoutes);
app.use("/admin",      adminRoutes);
app.use("/challenges", challengeRoutes);

app.get("/me", (req, res) => {
  res.json(req.session.user || null);
});

app.use((req, res) => {
  res.status(404).render("public/page-404");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use((req, res) => {
  res.status(404).render("public/page-404");
});