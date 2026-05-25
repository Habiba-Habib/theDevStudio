require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");

const authRoutes       = require("./routes/authRoutes");
const publicRoutes     = require("./routes/public");
const studentRoutes    = require("./routes/studentRoutes");
const instructorRoutes = require("./routes/instructor");
const adminRoutes      = require("./routes/adminRoutes");
const challengeRoutes  = require("./routes/challenges");
const coursesRoutes     = require("./routes/coursesRoutes");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(session({
  secret: process.env.SESSION_SECRET || "devstudiosecret",
  resave: false,
  saveUninitialized: false,
}));

app.use("/",       authRoutes);
app.use("/",           publicRoutes);
app.use("/student",    studentRoutes);
app.use("/instructor", instructorRoutes);
app.use("/admin",      adminRoutes);
app.use("/challenges", challengeRoutes);
app.use("/courses", coursesRoutes);

app.get("/me", (req, res) => res.json(req.session.user || null));
app.get("/dashboard", (req, res) => {
  const role = req.session.role;
  const dashboards = {
    student:    "/student/dashboard",
    instructor: "/instructor/dashboard",
    admin:      "/admin/dashboard"
  };
  res.redirect(dashboards[role] || "/login");
});

app.use((req, res) => {
  res.status(404).render("public/page-404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});


