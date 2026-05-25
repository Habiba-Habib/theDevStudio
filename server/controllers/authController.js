const users = []; // temporary memory DB (later MongoDB)

/* =========================
   SIGN UP
   ========================= */
exports.signup = (req, res) => {
  const { name, email, password, role } = req.body;

  // only allow student or instructor signup
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (!["student", "instructor"].includes(role)) {
    return res.status(400).json({ message: "Invalid signup role" });
  }

  const exists = users.find(u => u.email === email);

  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role
  };

  users.push(newUser);

  return res.status(201).json({
    message: "Signup successful",
    user: { id: newUser.id, name, email, role }
  });
};


/* =========================
   LOGIN
   ========================= */
exports.login = (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = users.find(
    u =>
      u.email === email &&
      u.password === password &&
      u.role === role
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // session
  
  req.session.userId = user.id;
  req.session.role = user.role;
  
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
    
  };

  return res.status(200).json({
    message: "Login successful",
    user: req.session.user
  });
};


/* =========================
   LOGOUT
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};