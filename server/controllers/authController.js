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

  req.session.userId = user._id.toString();
  req.session.role = user.role;
  req.session.user = {
    _id: user.id.toString(),
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



/* =========================
   LOGOUT
   ========================= */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};