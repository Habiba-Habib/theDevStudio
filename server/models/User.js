const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    fullname: String,
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true },
    password: String,
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    lastActive: { type: Date, default: Date.now },
    welcomeMessage: { type: String, default: "" },


    points: { type: Number, default: 0 },
    badges: [
      {
        name: String,
        icon: String,
        awardedAt: { type: Date, default: Date.now },
      },
    ],


    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  
    enrolledCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        enrolledAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
    completedCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        completedAt: { type: Date, default: Date.now },
      },
    ],

    certificates: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        certificateUrl: String,
        issuedAt: { type: Date, default: Date.now },
      },
    ],

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true } // gives createdAt (= memberSince) and updatedAt
);

module.exports = mongoose.model("User", userSchema);