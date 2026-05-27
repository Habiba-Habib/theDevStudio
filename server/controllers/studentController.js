const Payment = require("../models/payment");
const Course = require("../models/Course");

exports.getPaymentPage = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    res.render("student/course-payment", {
      course: course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

exports.processPayment = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    const paymentMethod = req.body.paymentMethod;
    const cardNumber = req.body.cardNumber;

    let paymentStatus = "failed";

    const cleanCardNumber = cardNumber.replace(/\s/g, "");

if (cleanCardNumber.length === 16) {
  paymentStatus = "successful";
}

    const payment = await Payment.create({
      student: req.session.userId,
      course: course._id,
      amount: course.price,
      paymentMethod: paymentMethod,
      status: paymentStatus,
    });

    if (paymentStatus === "successful") {
      await Course.findByIdAndUpdate(course._id, {
    $addToSet: { students: req.session.userId }
  });

  return res.render("student/payment-success", {
    course: course,
    payment: payment,
  });
    } else {
      return res.render("student/payment-failed", {
        course: course,
        payment: payment,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};