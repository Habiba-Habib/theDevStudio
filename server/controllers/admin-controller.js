const User      = require("../models/User");
const Challenge = require("../models/challenges");

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers      = await User.countDocuments();
    const totalChallenges = await Challenge.countDocuments({ deletedAt: null }).catch(() => 0);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const recentActivity = recentUsers.map(u => ({
      avatar:         u.avatar || "/images/avatars/avatar1g.png",
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

exports.updateProfile = async (req, res) => {
  try {
    const { fullname, username, email, location, bio, avatar } = req.body;

    await User.findByIdAndUpdate(req.session.user._id, {
      fullname, username, email, location, bio, avatar
    });

    const updated = await User.findById(req.session.user._id);
    req.session.user = {
      _id:   updated._id,
      name:  updated.name,
      email: updated.email,
      role:  updated.role
    };

    res.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
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
      avatar:   u.avatar || "/images/avatars/avatar1g.png",
      joinDate: u.createdAt
        ? u.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "N/A",
      progress: u.progress || 0,
      courses:  u.u.enrolledCourses?.length  || 0,
      students: u.students || 0
    }));

    res.render("admin/admin-users", { users: formatted });
  } catch (err) {
    console.error(err);
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

exports.getInstructorApplications = async (req, res) => {
  try {
    const users = await User.find({ 
      "instructorVerification.status": { $ne: "not_submitted" }
    }).sort({ "instructorVerification.submittedAt": -1 });

    const applications = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar || "/images/avatars/avatar1g.png",
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
    res.render("admin/create-challenge");
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

/* =========================
   LOGOUT
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};


