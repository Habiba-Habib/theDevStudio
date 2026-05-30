const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/payment');
//const upload = require('../config/cloudinary');

// ─── DASHBOARD ────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  try {
    const instructor = await User.findById(req.session.user._id);
const courses = await Course.find({ instructor: req.session.user._id });

const courseIds = courses.map(course => course._id);

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const enrollmentData = new Array(6).fill(0);
const revenueData = new Array(6).fill(0);

courses.forEach(course => {
  const createdMonth = course.createdAt ? course.createdAt.getMonth() : null;

  if (createdMonth !== null && createdMonth < 6) {
    enrollmentData[createdMonth] += course.students.length;
  }
});

const payments = await Payment.find({
  course: { $in: courseIds },
  status: 'successful'
});

payments.forEach(payment => {
  const paymentMonth = payment.createdAt ? payment.createdAt.getMonth() : null;

  if (paymentMonth !== null && paymentMonth < 6) {
    revenueData[paymentMonth] += payment.amount;
  }
});

// Stats for dashboard
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0);
    const totalRevenue = courses.reduce((sum, c) => sum + (c.price * c.students.length), 0);

   res.render('instructor/dashboard', {
  instructor,
  courses,
  stats: {
    totalCourses,
    totalStudents,
    totalRevenue,
    studentsChange: '',
    coursesChange: '',
    revenueChange: '',
    ratingChange: '',
    avgRating: courses.length
      ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
      : '0.0'
  },
  chartData: {
    months: monthLabels,
    enrollments: enrollmentData,
    revenue: revenueData
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── PROFILE ──────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect("/auth/login");
    }

    const instructor = await User.findById(req.session.user._id);

    if (!instructor) {
      return res.status(404).render("public/page-404", {
        message: "Instructor not found"
      });
    }

    const instructorCourses = await Course.find({
      instructor: req.session.user._id
    });

    res.render("shared/profile", {
      user: instructor,
      completedCourses: [],
      certificates: [],
      instructorCourses,
      adminStats: null,
      rank: null
    });
  } catch (err) {
    console.error("Instructor profile error:", err);
    res.status(500).render("public/page-404", {
      message: "Server error"
    });
  }
};

exports.getEditProfile = async (req, res) => {
  try {
    const instructor = await User.findById(req.session.user._id);
    res.render('shared/edit-profile', { user: instructor, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, username, email, bio, location, avatar } = req.body;

    const updateData = { name, username, email, bio, location, avatar };

    // If a new avatar was uploaded, update it
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    await User.findByIdAndUpdate(req.session.user._id, updateData);
    res.redirect('/instructor/profile');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── CREATE COURSE — STEP 1 ───────────────────────────────────
// Collects: title, shortDescription, fullDescription,
//           category, level, thumbnail

exports.getCreateStep1 = async (req, res) => {
  try {
    // Check if there's an in-progress course to resume
    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

    res.render('instructor/create-step1', { draft, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.postCreateStep1 = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, category, level } = req.body;

    // Check if a draft already exists — update it, don't create a new one
    let course = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

    const thumbnailUrl = req.file ? req.file.path : (course ? course.thumbnail : '');

    if (course) {
      // Update existing draft
      await Course.findByIdAndUpdate(course._id, {
        title,
        shortDescription,
        fullDescription,
        category,
        level,
        thumbnail: thumbnailUrl
      });
    } else {
      // Create new draft
      course = await Course.create({
        title,
        shortDescription,
        fullDescription,
        category,
        level,
        thumbnail: thumbnailUrl,
        instructor: req.session.user._id,
        isPublished: false
      });
    }

    // Move to step 2
    res.redirect('/instructor/create/step2');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── CREATE COURSE — STEP 2 ───────────────────────────────────
// Collects: learning outcomes, sections, lessons

exports.getCreateStep2 = async (req, res) => {
  try {
    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished: false
    });

    // If no draft exists, send back to step 1
    if (!draft) return res.redirect('/instructor/create/step1');

    res.render('instructor/create-step2', { draft, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.postCreateStep2 = async (req, res) => {
  try {
    const { learningOutcomes, sections } = req.body;

    // learningOutcomes comes as a string with one per line
    const outcomesArray = learningOutcomes
      .split('\n')
      .map(o => o.trim())
      .filter(o => o);

    // sections comes as a JSON string from the frontend
    const sectionsArray = JSON.parse(sections);

    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished : false
    });

    if (!draft) return res.redirect('/instructor/create/step1');

    await Course.findByIdAndUpdate(draft._id, {
      learningOutcomes: outcomesArray,
      sections: sectionsArray
    });

    res.redirect('/instructor/create/step3');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── CREATE COURSE — STEP 3 ───────────────────────────────────
// Collects: price, duration — shows preview — final publish

exports.getCreateStep3 = async (req, res) => {
  try {
    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished : false
    });

    if (!draft) return res.redirect('/instructor/create/step1');

    res.render('instructor/create-step3', { draft, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.postCreateStep3 = async (req, res) => {
  try {
    const { price, duration } = req.body;

    const draft = await Course.findOne({
      instructor: req.session.user._id,
      isPublished : false
    });

    if (!draft) return res.redirect('/instructor/create/step1');

    // Final save — change status from draft to published
    await Course.findByIdAndUpdate(draft._id, {
      price: Number(price),
      duration,
      isPublished : true
    });

    res.redirect('/instructor/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── EDIT COURSE ──────────────────────────────────────────────

exports.getEditCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.session.user._id // security: only their own courses
    });

    if (!course) return res.status(404).render('public/error-404');

    res.render('instructor/edit-course', { course, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, category, level, price, duration } = req.body;

    const updateData = {
      title,
      shortDescription,
      fullDescription,
      category,
      level,
      price,
      duration
    };

    if (req.file) {
      updateData.thumbnail = req.file.path;
    }

    await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.session.user._id },
      updateData
    );

    res.redirect('/instructor/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── DELETE COURSE ────────────────────────────────────────────

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.session.user._id // security: only their own courses
    });

    res.redirect('/instructor/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};

// ─── VIEW ENROLLED STUDENTS ───────────────────────────────────

exports.getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.session.user._id
    });

    if (!course) return res.status(404).render('public/error-404');

    const students = await User.find({
      enrolledCourses: course._id,
      role: 'student'
    }).select('name email avatar memberSince progress lastActive enrolledAt');

    // Calculate stats
    const avgProgress = students.length
      ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
      : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeToday = students.filter(s =>
      s.lastActive && new Date(s.lastActive) >= today
    ).length;

    const nearCompletion = students.filter(s =>
      (s.progress || 0) >= 80
    ).length;

    res.render('instructor/enrolled-students', {
      course,
      students,
      avgProgress,
      activeToday,
      nearCompletion
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
};
