const User      = require("../models/User");
const Challenge = require("../models/challenges");
const Course = require("../models/Course");

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers      = await User.countDocuments();
    const totalChallenges = await Challenge.countDocuments({ deletedAt: null }).catch(() => 0);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const recentActivity = recentUsers.map(u => ({
      avatar:         u.avatar || "avatar1g.png",
      userName:       u.name,
      action:         "joined the platform",
      highlight:      u.role.charAt(0).toUpperCase() + u.role.slice(1),
      highlightColor: u.role === "student" ? "teal" : u.role === "instructor" ? "yellow" : "pink"
    }));

    res.render("admin/dashboard", {
      admin: {
        name:     req.session.user.name,
        subtitle: "Here's what's happening on your platform today."
      },
      stats: {
        totalUsers,
        usersChange:      "+12%",
        totalCourses:     0,
        coursesChange:    "+5%",
        totalRevenue:     "0",
        revenueChange:    "+0%",
        totalChallenges,
        challengesChange: "+3%"
      },
      recentActivity
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id) || req.session.user;

    const adminStats = {
      totalUsers: await User.countDocuments(),
      totalChallenges: await Challenge.countDocuments()
    };

    res.render("shared/profile", {
      user,
      completedCourses: [],
      certificates: [],
      instructorCourses: [],
      adminStats,
      rank: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id) || req.session.user;
    res.render("shared/edit-profile", { user, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullname, username, email, location, bio } = req.body;
    const avatar = (req.body.avatar || '').replace(/^.*\//, ''); // keep filename only

    await User.findByIdAndUpdate(req.session.user._id, {
      fullname, username, email, location, bio, avatar
    });

    const updated = await User.findById(req.session.user._id);
    req.session.user = {
      _id:   updated._id,
      name:  updated.name,
      email: updated.email,
      role:  updated.role,
      avatar: updated.avatar,
    };

    res.redirect('/admin/profile');
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id);
    res.render('shared/edit-profile', { user, errors: ['Something went wrong. Please try again.'] });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const formatted = users.map(u => ({
      _id:      u._id,
      name:     u.name,
      email:    u.email,
      role:     u.role.charAt(0).toUpperCase() + u.role.slice(1),
      status:   (u.status || "active").charAt(0).toUpperCase() + (u.status || "active").slice(1),
      avatar:   u.avatar || "avatar1g.png",
      joinDate: u.createdAt
        ? u.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "N/A",
      progress: u.progress || 0,
      courses:  u.enrolledCourses?.length  || 0,
      students: u.students || 0
    }));

  const blockedInstructors = formatted.filter(
  user => user.role === "Instructor" && user.status === "Blocked"
);

const usersToShow = formatted.filter(
  user => !(user.role === "Instructor" && user.status === "Blocked")
);

res.render("admin/admin-users", {
  users: usersToShow,
  blockedInstructors
});
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("completedCourses.course")
      .populate("certificates.course");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("shared/profile", {
      user,
      completedCourses: user.completedCourses || [],
      certificates: user.certificates || [],
      instructorCourses: [],
      adminStats: null,
      rank: null
    });
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).send("Server error");
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    const allowed = ["student", "instructor", "admin"];

    if (!allowed.includes(newRole)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    await User.findByIdAndUpdate(userId, { role: newRole });
    res.json({ success: true, message: "Role updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.status = user.status === "active" ? "suspended" : "active";
    await user.save();

    res.json({ success: true, status: user.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
exports.blockInstructor = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role !== "instructor") {
      return res.status(400).json({ success: false, message: "Only instructors can be blocked." });
    }

    user.status = "blocked";
    await user.save();

    await Course.updateMany(
      { instructor: user._id },
      { $set: { isPublished: false } }
    );

    res.json({ success: true, message: "Instructor blocked." });
  } catch (err) {
    console.error("blockInstructor error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.unblockInstructor = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role !== "instructor") {
      return res.status(400).json({ success: false, message: "Only instructors can be unblocked." });
    }

    user.status = "active";
    await user.save();

    res.json({ success: true, message: "Instructor unblocked." });
  } catch (err) {
    console.error("unblockInstructor error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message: "User removed." });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
exports.getChallenges = async (req, res) => {
  try {
    const challenges      = await Challenge.find({ deletedAt: null }).sort({ createdAt: -1 });
    const recentlyDeleted = await Challenge.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 });

    res.render("admin/manage-challenges", { challenges, recentlyDeleted });
  } catch (err) {
    console.error(err);
    res.render("admin/manage-challenges", { challenges: [], recentlyDeleted: [] });
  }
};
exports.deleteChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("deleteChallenge error:", err);
    res.status(500).json({ success: false, message: "Failed to delete challenge." });
  }
};

exports.restoreChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndUpdate(req.params.id, {
      deletedAt: null
    });

    res.json({ success: true });
  } catch (err) {
    console.error("restoreChallenge error:", err);
    res.status(500).json({ success: false, message: "Failed to restore challenge." });
  }
};

exports.permanentlyDeleteChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    console.error("permanentlyDeleteChallenge error:", err);
    res.status(500).json({ success: false, message: "Failed to permanently delete challenge." });
  }
};
exports.getInstructorApplications = async (req, res) => {
  try {
    const users = await User.find({ 
      "instructorVerification.status": { $ne: "not_submitted" }
    }).sort({ "instructorVerification.submittedAt": -1 });

    const applications = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar || "avatar1g.png",
      experience: u.instructorVerification?.experience || "N/A",
      expertise: u.instructorVerification?.expertise?.split(",").map(e => e.trim()) || [],
      applicationDate: u.instructorVerification?.submittedAt || u.createdAt,
      status: u.instructorVerification?.status || "pending",
      bio: u.bio || "",
      jobTitle: u.instructorVerification?.jobTitle || "",
      cvUrl: u.instructorVerification?.cvUrl || "",
      certificateUrl: u.instructorVerification?.certificateUrl || "",
      linkedinUrl: u.instructorVerification?.linkedinUrl || "",
      portfolioUrl: u.instructorVerification?.portfolioUrl || ""
    }));

    res.render("admin/instructor-applications", { applications });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.approveInstructor = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
         instructorStatus: 'approved',
      'instructorVerification.status': 'approved'
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.rejectInstructor = async (req, res) => {
  try {
    const { reason } = req.body;
    await User.findByIdAndUpdate(req.params.userId, {
      instructorStatus: 'rejected',
      'instructorVerification.status': 'rejected',
      'instructorVerification.rejectionReason': reason || 'No reason provided'
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const users = []; // temporary memory DB (later MongoDB)

/* =========================
   SIGN UP
   ========================= */
exports.signup = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.render('auth/signup', { error: 'Missing fields' });
  }

  if (!["student", "instructor"].includes(role)) {
    return res.render('auth/signup', { error: 'Invalid role' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.render('auth/signup', { error: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role
  };

  users.push(newUser);
  return res.redirect('/auth/login');
};

/* =========================
   LOGIN
   ========================= */
exports.login = (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.render('auth/login', { error: 'Missing fields', email });
  }

  const user = users.find(
    u => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    return res.render('auth/login', { error: 'Invalid credentials', email });
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const dashboards = {
    student:    "/student/dashboard",
    instructor: "/instructor/dashboard",
    admin:      "/admin/dashboard"
  };

  return res.redirect(dashboards[user.role] || "/");
};

exports.getCreateChallenge = async (req, res) => {
  try {
    res.render("admin/create-challenge", {
      mode: "create",
      challenge: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.postCreateChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      points,
      starterCode,
      testCases,
      isPublished
    } = req.body;

    if (!title || !description || !difficulty || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ message: "At least one test case is required." });
    }

    const allowedDifficulties = ["easy", "medium", "hard"];
    const normalizedDifficulty = String(difficulty).toLowerCase();

    if (!allowedDifficulties.includes(normalizedDifficulty)) {
      return res.status(400).json({ message: "Invalid difficulty value." });
    }

    const challenge = await Challenge.create({
      title: title.trim(),
      description: description.trim(),
      difficulty: normalizedDifficulty,
      category: category.trim(),
      points: Number(points) || 100,
      starterCode: starterCode || "// Write your solution here\n",
      testCases,
      createdBy: req.session.user._id,
      isPublished: Boolean(isPublished)
    });

    res.status(201).json({
      success: true,
      message: "Challenge saved successfully.",
      challengeId: challenge._id
    });
  } catch (err) {
    console.error("postCreateChallenge error:", err);
    res.status(500).json({ message: "Failed to save challenge." });
  }
};
exports.getEditChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    res.render("admin/create-challenge", {
      mode: "edit",
      challenge
    });
  } catch (err) {
    console.error("getEditChallenge error:", err);
    res.status(500).send("Server error");
  }
};
exports.postEditChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      points,
      starterCode,
      testCases,
      isPublished
    } = req.body;

    if (!title || !description || !difficulty || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ message: "At least one test case is required." });
    }

    const normalizedDifficulty = String(difficulty).toLowerCase();

    if (!["easy", "medium", "hard"].includes(normalizedDifficulty)) {
      return res.status(400).json({ message: "Invalid difficulty value." });
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim(),
        difficulty: normalizedDifficulty,
        category: category.trim(),
        points: Number(points) || 100,
        starterCode: starterCode || "// Write your solution here\n",
        testCases,
        isPublished: Boolean(isPublished)
      },
      { new: true, runValidators: true }
    );

    if (!updatedChallenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    res.json({
      success: true,
      message: "Challenge updated successfully.",
      challengeId: updatedChallenge._id
    });
  } catch (err) {
    console.error("postEditChallenge error:", err);
    res.status(500).json({ message: "Failed to update challenge." });
  }
};
/* =========================
   LOGOUT
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getUserCourses = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name"
      }
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    let courses = [];

    if (user.role === "student") {
      courses = (user.enrolledCourses || [])
        .filter(item => item.course)
        .map(item => ({
          title: item.course.title,
          image: item.course.thumbnail,
          instructorName: item.course.instructor?.name || "Instructor",
          description: item.course.shortDescription,
          duration: item.course.duration,
          progress: item.progress || 0,
          status: item.progress >= 100 ? "completed" : "ongoing"
        }));
    }

    if (user.role === "instructor") {
      const instructorCourses = await Course.find({ instructor: user._id }).sort({ createdAt: -1 });

      courses = instructorCourses.map(course => ({
        title: course.title,
        image: course.thumbnail,
        instructorName: user.name,
        description: course.shortDescription,
        duration: course.duration,
        progress: course.isPublished ? 100 : 0,
        status: course.isPublished ? "published" : "draft"
      }));
    }

    res.render("student/my-courses", {
  courses,
  totalCourses: courses.length,
  inProgressCourses: courses.filter(course => course.status !== "completed").length,
  completedCourses: courses.filter(course => course.status === "completed").length,
  avgProgress: courses.length
    ? `${Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)}%`
    : "0%"
});
} catch (err) {
  console.error("getUserCourses error:", err);
  res.status(500).send("Server error");
}
};

exports.getCourseApplications = async (req, res) => {
  const courses = await Course.find({ deletedAt: null })
    .populate("instructor", "name email avatar")
    .sort({ submittedAt: -1, createdAt: -1 });

  res.render("admin/course-application", { courses });
};

exports.approveCourse = async (req, res) => {
  await Course.findByIdAndUpdate(req.params.courseId, {
    approvalStatus: "approved",
    isPublished: true,
    rejectionReason: ""
  });

  res.json({ success: true });
};

exports.rejectCourse = async (req, res) => {
  await Course.findByIdAndUpdate(req.params.courseId, {
    approvalStatus: "rejected",
    isPublished: false,
    rejectionReason: req.body.reason || "No reason provided"
  });

  res.json({ success: true });
};

exports.previewCourseContent = async (req, res) => {
  const course = await Course.findById(req.params.courseId).populate("instructor", "name avatar");
  if (!course) return res.status(404).render("public/page-404");

  const completedLessons = [];
  const allLessons = course.sections.flatMap(s => s.lessons);
  const activeLessonId = req.query.lesson || allLessons[0]?._id?.toString() || null;

  res.render("student/course-content", {
    course,
    user: req.session.user,
    enrollment: { progress: 0, completedLessons: [], notes: [] },
    completedLessons,
    activeLessonId,
    totalLessons: allLessons.length,
    isInstructorOwner: false,
    activeNote: "",
    activeSubmission: null
  });
};
exports.getAdminCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).render("public/page-404");
    }

    const users = await User.find({
      role: "student",
      "enrolledCourses.course": course._id
    }).select("name email avatar createdAt lastActive enrolledCourses");

    const students = users.map(user => {
      const enrollment = user.enrolledCourses.find(e =>
        e.course.toString() === course._id.toString()
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        memberSince: user.createdAt,
        lastActive: user.lastActive,
        enrolledAt: enrollment?.enrolledAt,
        progress: enrollment?.progress || 0
      };
    });

    const avgProgress = students.length
      ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
      : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeToday = students.filter(s =>
      s.lastActive && new Date(s.lastActive) >= today
    ).length;

    const nearCompletion = students.filter(s => (s.progress || 0) >= 80).length;

    res.render("instructor/enrolled-students", {
      course,
      students,
      avgProgress,
      activeToday,
      nearCompletion,
      submissions: []
    });
  } catch (err) {
    console.error("getAdminCourseStudents error:", err);
    res.status(500).send("Server error");
  }
};
