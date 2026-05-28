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
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1. Find the user in your real MongoDB database
    const user = await User.findOne({ email, role });
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


/* =========================
   LOGOUT (Clear Session)
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};