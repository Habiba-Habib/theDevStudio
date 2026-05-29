// ===== ROLE =====
function getRole() {
  return localStorage.getItem("role");
}

// ===== NAVIGATION =====
function goHome() {
  window.location.href = "/index.html";
}

function goLogin() {
  window.location.href = "/auth/login";
}

function goSignup() {
  window.location.href = "/auth/signup";
}

function goCourses() {
  window.location.href = "/public/pages/public/all-courses.html";
}

function goChallenges() {
  window.location.href = "/public/pages/public/coding-challenges.html";
}

function goDashboard() {
  const routes = {
    instructor: "/public/pages/instructor/dashboard.html",
    student:    "/public/pages/student/dashboard.html",
    admin:      "/public/pages/admin/dashboard.html"
  };

  window.location.href = routes[getRole()] || "/public/pages/public/login.html";
}

function goProfile() {
  const routes = {
    instructor: "/public/pages/instructor/profile.html",
    student:    "/public/pages/student/profile.html",
    admin:      "/public/pages/admin/profile.html"
  };
  
  window.location.href = routes[getRole()] || "/public/pages/public/login.html";
}

function logout() {
  localStorage.removeItem("role");
  window.location.href = "/index.html";
}

// ===== GUEST NAVBAR (YOUR DESIGN) =====
function createGuestNavbar() {
  const nav = document.createElement("nav");
  nav.className = "navbar";

  nav.innerHTML = `
    <div class="nav-logo" onclick="goHome()" style="cursor:pointer;">
      <div class="nav-logo-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      EduPlatform
    </div>

    <div class="nav-links">
      <a onclick="goCourses()">Courses</a>
      <a onclick="goChallenges()">Challenges</a>
    </div>

    <div class="nav-actions">
      <span class="btn-login" onclick="goLogin()">Login</span>
      <button class="btn-signup" onclick="goSignup()">Sign Up</button>
    </div>
  `;

  return nav;
}

// ===== USER NAVBAR =====
function createUserNavbar() {
  const nav = document.createElement("nav");
  nav.className = "top-navbar";

  nav.innerHTML = `
  <button class="nav-left" onclick="goHome()" style="cursor:pointer;">
  <div class="nav-logo-icon">
    <i class="fa-solid fa-graduation-cap"></i>
  </div>
  <span class="logo-text">EduPlatform</span>
</button>
    
    

    <div class="nav-center">
      <a onclick="goCourses()">Courses</a>
      <a onclick="goDashboard()">Dashboard</a>
       <a onclick="goProfile()">Profile</a>
    </div>

    <div class="nav-actions">
      <button class="btn-signup" onclick="logout()">Logout</button>
    </div>
  `;

  return nav;
}

// ===== RENDER =====
function renderNavbar() {
  const role = getRole();

  const nav = role
    ? createUserNavbar()
    : createGuestNavbar();

  document.body.prepend(nav);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", renderNavbar);
// ===== ROLE =====
function getRole() {
  return localStorage.getItem("role");
}

// ===== NAVIGATION =====
function goHome() {
  window.location.href = "/";
}

function goLogin() {
  window.location.href = "/login";
}

function goSignup() {
  window.location.href = "/signup";
}

function goCourses() {
  window.location.href = "/courses";
}

function goChallenges() {
  window.location.href = "/challenges";
}

function goDashboard() {
  const routes = {
    instructor: "/instructor/dashboard",
    student: "/student/dashboard",
    admin: "/admin/dashboard"
  };

  window.location.href = routes[getRole()] || "/login";
}

function goProfile() {
  const routes = {
    instructor: "/instructor/profile",
    student: "/student/profile",
    admin: "/admin/profile"
  };

  window.location.href = routes[getRole()] || "/login";
}

function logout() {
  localStorage.removeItem("role");
  window.location.href = "/";
}

// ===== GUEST NAVBAR =====
function createGuestNavbar() {
  const nav = document.createElement("nav");
  nav.className = "navbar";

  nav.innerHTML = `
    <div class="nav-logo" onclick="goHome()" style="cursor:pointer;">
      <div class="nav-logo-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      EduPlatform
    </div>

    <div class="nav-links">
      <a onclick="goCourses()">Courses</a>
      <a onclick="goChallenges()">Challenges</a>
    </div>

    <div class="nav-actions">
      <span class="btn-login" onclick="goLogin()">Login</span>
      <button class="btn-signup" onclick="goSignup()">Sign Up</button>
    </div>
  `;

  return nav;
}

// ===== USER NAVBAR =====
function createUserNavbar() {
  const nav = document.createElement("nav");
  nav.className = "top-navbar";

  nav.innerHTML = `
    <button class="nav-left" onclick="goHome()">
      <div class="nav-logo-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>

      <span class="logo-text">EduPlatform</span>
    </button>

    <div class="nav-center">
      <a onclick="goCourses()">Courses</a>
      <a onclick="goDashboard()">Dashboard</a>
      <a onclick="goProfile()">Profile</a>
    </div>

    <div class="nav-actions">
      <button class="btn-signup" onclick="logout()">
        Logout
      </button>
    </div>
  `;

  return nav;
}

// ===== RENDER =====
function renderNavbar() {
  const role = getRole();

  const nav = role
    ? createUserNavbar()
    : createGuestNavbar();

  document.body.prepend(nav);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", renderNavbar);