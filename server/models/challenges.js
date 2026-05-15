const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isHidden: {
  
    type: Boolean,
    default: false,
  },
});

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "Difficulty is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    
    },
    points: {
      type: Number,
      required: [true, "Points are required"],
      min: 0,
    },
    starterCode: {
      type: String,
      default: "// Write your solution here\n",
    },
    testCases: [testCaseSchema],
   
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   
    solvedCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);