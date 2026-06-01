const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");

const app = express();


const passport = require("passport");
const { configurePassport } = require("./config/passport");

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "devstudiosecret",
  resave: false,
  saveUninitialized: false
}));

configurePassport();

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, "../public")));   //added
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const authRoutes       = require("./routes/authRoutes");
const studentRoutes    = require("./routes/studentRoutes");
const instructorRoutes = require("./routes/instructor");
const adminRoutes      = require("./routes/adminRoutes");
const challengeRoutes  = require("./routes/challenges");
const coursesRoutes     = require("./routes/coursesRoutes");
const publicRoutes     = require("./routes/public");  
const uploadRoute = require('./routes/upload'); //added

app.use("/auth",       authRoutes);
app.use("/student",    studentRoutes);
app.use("/instructor", instructorRoutes);
app.use("/admin",      adminRoutes);
app.use("/challenges", challengeRoutes);
app.use("/courses", coursesRoutes);
app.use('/api', uploadRoute); //added
app.use("/",           publicRoutes);

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






