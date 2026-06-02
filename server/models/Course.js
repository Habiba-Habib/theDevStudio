const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  format: { type: String }
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'text'], default: 'video' },
  videoSource: { type: String, enum: ['url', 'upload'], default: 'url' },
  videoUrl: { type: String, default: '' },
  videoFile: { type: String, default: '' },
  content: { type: String, default: '' },
  duration: { type: String, default: '' },
  resources: [resourceSchema]
});

const sectionSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  lessons: [lessonSchema]
  
});

const courseSchema = new mongoose.Schema({

  title:            { type: String, required: true },
  shortDescription: { type: String },
  fullDescription:  { type: String },
  category: {
    type: String,
    enum: ["Web Development", "Data Science", "Design", "Business", "Mobile Development", "Machine Learning"],
    required: true
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true
  },

  thumbnail: { type: String, default: "/images/course1.jpg" },

  learningOutcomes: [String],
  sections:         [sectionSchema],

  price:    { type: Number, required: true, default: 0 },
  duration: { type: String },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  rating:   { type: Number, default: 0 },

  isPublished: { type: Boolean, default: false },
  deletedAt:   { type: Date, default: null }

}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;