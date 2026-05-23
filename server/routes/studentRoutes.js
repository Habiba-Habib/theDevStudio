const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

router.get("/payment/:courseId", studentController.getPaymentPage);

router.post("/payment/:courseId", studentController.processPayment);

module.exports = router;