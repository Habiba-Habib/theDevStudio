const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
    const nameRegex = /^[A-Za-z\s]{2,}$/;

    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        message: "Name must contain letters only and be at least 2 characters."
      });
    }

    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid signup role" });
    }

    // 1. Check if user already exists in your real MongoDB database
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 2. Hash the password securely (so passwords aren't saved in plain text)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save the new user to MongoDB!
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
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
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.maxAge = null;
      req.session.cookie.expires = false;
    }

    return res.status(201).json({
      message: "Signup successful",
      redirectUrl: "/auth/onboarding"
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

    // Update lastActive on login
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    // 4. Remember Me — extend session to 30 days, otherwise expires on browser close
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = null;    // clear any maxAge
      req.session.cookie.expires = false;  // session cookie — dies when browser closes
    }

    const dashboards = {
      student: "/student/dashboard",
      instructor: "/instructor/dashboard",
      admin: "/admin/dashboard"
    };

    const redirectUrl = req.session.returnTo || dashboards[user.role] || "/student/dashboard";
    delete req.session.returnTo;

    // Force-save the session so the cookie maxAge is written before we respond
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session error, please try again" });
      }
      return res.status(200).json({
        message: "Login successful",
        user: req.session.user,
        redirectUrl
      });
    });
    
  } catch (error) {
    console.error("Login database error:", error);
    return res.status(500).json({ message: "Server database error" });
  }
};
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.session.userId = user._id;
    req.session.role = user.role;

    return res.status(200).json({
      message: "Admin login successful",
      user: req.session.user,
      redirectUrl: "/admin/dashboard"
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server database error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
      if (!email || !email.trim()) {
      return res.render("auth/forgot-password", {
        successMessage: null,
        errorMessage: "Please enter your email address."
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    const successMessage = "If that email exists, a reset link has been sent.";

    if (!user) {
      return res.render("auth/forgot-password", {
        successMessage,
        errorMessage: null
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset your TheDevStudio password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    return res.render("auth/forgot-password", {
      successMessage,
      errorMessage: null
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.render("auth/forgot-password", {
      successMessage: null,
      errorMessage: "Could not send reset email. Please try again."
    });
  }
};

exports.getResetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.render("auth/reset-password", {
      token: null,
      errorMessage: "Reset link is invalid or expired.",
      successMessage: null
    });
  }

  res.render("auth/reset-password", {
    token: req.params.token,
    errorMessage: null,
    successMessage: null
  });
};

exports.postResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || password !== confirmPassword) {
    return res.render("auth/reset-password", {
      token: req.params.token,
      errorMessage: "Passwords do not match.",
      successMessage: null
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.render("auth/reset-password", {
      token: null,
      errorMessage: "Reset link is invalid or expired.",
      successMessage: null
    });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.render("auth/reset-password", {
    token: null,
    errorMessage: null,
    successMessage: "Password reset successful. You can now log in."
  });
};
/* =========================
   ONBOARDING
   ========================= */
exports.getOnboarding = (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");
  res.render("auth/onboarding", { user: req.session.user });
};

exports.postOnboarding = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in", redirectUrl: "/auth/login" });

  const { avatar, experienceLevel, intendedRole } = req.body;
  const validLevels = ["beginner", "intermediate", "advanced"];

  if (!avatar) return res.status(400).json({ message: "Please choose an avatar" });

  // Experience level is required for students, optional for instructors
  if (intendedRole !== "instructor") {
    if (!experienceLevel || !validLevels.includes(experienceLevel))
      return res.status(400).json({ message: "Please choose your experience level" });
  }

  const updateData = { avatar, onboardingComplete: true };
  if (experienceLevel && validLevels.includes(experienceLevel)) {
    updateData.experienceLevel = experienceLevel;
  }

  await User.findByIdAndUpdate(req.session.userId, updateData);

  // If user wants to teach → send them to the instructor application
  // (role stays "student" in DB until admin approves the application)
  let redirectUrl;
  if (intendedRole === "instructor") {
    redirectUrl = "/become-instructor";
  } else {
    const role = req.session.role || "student";
    const dashboards = { student: "/student/dashboard", instructor: "/instructor/dashboard" };
    redirectUrl = dashboards[role] || "/student/dashboard";
  }

  return res.status(200).json({ redirectUrl });
};

/* =========================
   LOGOUT (Clear Session)
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};

/* =========================
   OAUTH CALLBACKS
   ========================= */
exports.handleOAuthCallback = (req, res) => {
  req.session.user = {
    _id:   req.user._id,
    name:  req.user.name,
    email: req.user.email,
    role:  req.user.role
  };
  req.session.userId = req.user._id;
  req.session.role   = req.user.role;

  res.redirect(`/${req.user.role}/dashboard`);
};