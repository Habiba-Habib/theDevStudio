const Payment = require("../models/payment");
const Course = require("../models/Course");
const User = require("../models/User");
const Challenge = require("../models/challenges");

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

   const cleanCardNumber = (cardNumber || "").replace(/\s/g, "");

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

  await User.findByIdAndUpdate(req.session.userId, {
  $addToSet: {
    enrolledCourses: {
      course: course._id,
      progress: 0
    }
  }
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


//Added for dashboard
exports.getDashboard = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const user = await User.findById(req.session.userId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name"
      }
    });

    if (!user) {
      return res.redirect("/auth/login");
    }

    const courses = user.enrolledCourses
      .filter(enrollment => enrollment.course)
      .map(enrollment => ({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.instructor?.name || "Unknown Instructor",
        progress: enrollment.progress || 0
      }));

    const averageProgress = courses.length
      ? Math.round(
          courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
        )
      : 0;

    const allUsersByPoints = await User.find()
      .sort({ points: -1 })
      .select("_id");

    const currentUserRank =
      allUsersByPoints.findIndex(u => u._id.toString() === user._id.toString()) + 1;

    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(5)
      .select("name avatar points");

    const leaderboard = topUsers.map((user, index) => ({
      name: user.name,
      avatar: user.avatar || "/images/avatars/avatar1g.png",
      points: user.points || 0,
      rank: index + 1
    }));

    const rawChallenges = await Challenge.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(3);

   const challenges = rawChallenges.map(challenge => {
  const dueInDays = challenge.dueDate
  ? Math.max(
      0,
      Math.ceil((challenge.dueDate - new Date()) / (1000 * 60 * 60 * 24))
    )
  : 7;

  return {
    title: challenge.title,
    difficulty: challenge.difficulty,
    points: challenge.points,
    dueInDays
  };
});
    const stats = {
      enrolledCourses: courses.length,
      enrolledChange: "",
      progress: averageProgress,
      progressChange: "",
      rank: currentUserRank || 0,
      rankLabel: currentUserRank ? "Global Rank" : "",
      totalPoints: user.points || 0,
      pointsChange: ""
    };

    res.render("student/dashboard", {
      user,
      stats,
      courses,
      challenges,
      leaderboard
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};
exports.getMyCourses = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const user = await User.findById(req.session.userId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name"
      }
    });

    if (!user) {
      return res.redirect("/auth/login");
    }

    const courses = user.enrolledCourses
      .filter(enrollment => enrollment.course)
      .map(enrollment => ({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        image: enrollment.course.thumbnail,
        instructorName: enrollment.course.instructor?.name || "Instructor",
        description: enrollment.course.shortDescription,
        duration: enrollment.course.duration,
        progress: enrollment.progress || 0,
        status: enrollment.progress >= 100 ? "completed" : "ongoing"
      }));

    res.render("student/my-courses", {
      courses,
      totalCourses: courses.length,
      inProgressCourses: courses.filter(course => course.status !== "completed").length,
      completedCourses: courses.filter(course => course.status === "completed").length
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};