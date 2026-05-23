const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "wallet", "cash"],
      default: "card",
    },

    status: {
      type: String,
      enum: ["successful", "failed"],
      required: true,
    },

    transactionId: {
      type: String,
      default: () => "TXN-" + Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);