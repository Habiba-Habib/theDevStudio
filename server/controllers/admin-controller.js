const User      = require("../models/User");
const Challenge = require("../models/challenges");

// ─── Dashboard ───────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const admin = await User.findById(req.session.user._id);

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
        name:     admin.name,
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

// ─── Profile ─────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render("admin/edit-profile", { user });
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

// ─── User Management ─────────────────────────────────────────
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
      courses:  u.courses  || 0,
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

// ─── Challenges Oversight ─────────────────────────────────────
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