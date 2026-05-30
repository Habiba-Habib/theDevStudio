const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* =========================
   SIGN UP (Save to MongoDB)
   ========================= */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // only allow student or instructor signup
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid signup role" });
    }

    // 1. Check if user already exists in your real MongoDB database
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 2. Hash the password securely (so passwords aren't saved in plain text)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save the new user to MongoDB!
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    req.session.userId = newUser._id;
    req.session.role = newUser.role;

    return res.status(201).json({
      message: "Signup successful",
      user: { id: newUser._id, name, email, role }
    });
  } catch (error) {
    console.error("Signup database error:", error);
    return res.status(500).json({ message: "Server database error" });
  }
};


/* =========================
   LOGIN (Read from MongoDB)
   ========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare the encrypted password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Set all session variables for student/instructor routes
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.userId = user._id;
    req.session.role = user.role;

    return res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    console.error("Login database error:", error);
    return res.status(500).json({ message: "Server database error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always show same message for security
  if (!user) {
    return res.render("auth/forgot-password", {
      successMessage: "If that email exists, a reset link has been sent.",
      errorMessage: null
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
  await user.save();

  const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${token}`;

  // For development, you can log it first
  console.log("Password reset link:", resetUrl);

  return res.render("auth/forgot-password", {
    successMessage: "If that email exists, a reset link has been sent.",
    errorMessage: null
  });
};
/* =========================
   LOGOUT (Clear Session)
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};