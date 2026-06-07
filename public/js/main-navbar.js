let currentUser = null;
const navText = window.devStudioI18n || {};
const currentLocale = navText.locale || "en";

function t(key, fallback) {
  return navText[key] || fallback;
}

function languageSwitcher() {
  return `
    <div class="language-switcher" aria-label="Language switcher">
      <a href="/language/en" class="${currentLocale === "en" ? "active" : ""}">EN</a>
      <span></span>
      <a href="/language/ar" class="${currentLocale === "ar" ? "active" : ""}">AR</a>
    </div>
  `;
}
async function fetchCurrentUser() {
  try {
    const res = await fetch("/me");
    currentUser = await res.json();
  } catch (err) {
    currentUser = null;
  }
}

function goHome() {
  window.location.href = "/";
}

function goLogin() {
  window.location.href = "/auth/login";
}

function goSignup() {
  window.location.href = "/auth/signup";
}

function goCourses() {
  window.location.href = "/courses/all-courses";
}

function goChallenges() {
  window.location.href = "/challenges";
}

function goDashboard() {
  const routes = {
    student: "/student/dashboard",
    instructor: "/instructor/dashboard",
    admin: "/admin/dashboard"
  };

  window.location.href = routes[currentUser?.role] || "/auth/login";
}

function goProfile() {
  const routes = {
    student: "/student/profile",
    instructor: "/instructor/profile",
    admin: "/admin/profile"
  };

  window.location.href = routes[currentUser?.role] || "/auth/login";
}

async function logout() {
  await fetch("/auth/logout", { method: "POST" });
  window.location.href = "/";
}

function createGuestNavbar() {
  const nav = document.createElement("nav");
  nav.className = "top-navbar";

  nav.innerHTML = `
    <button class="nav-left" onclick="goHome()" style="cursor:pointer;">
      <div class="nav-logo-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <span class="logo-text">TheDevStudio</span>
    </button>

    <div class="nav-center">
  <a onclick="goCourses()">${t("courses", "Courses")}</a>
  <a onclick="goChallenges()">${t("challenges", "Challenges")}</a>
</div>

<div class="nav-actions">
  ${languageSwitcher()}
  <button class="btn-login" onclick="goLogin()">${t("login", "Login")}</button>
  <button class="btn-signup" onclick="goSignup()">${t("signup", "Sign Up")}</button>
</div>
  `;

  return nav;
}

function createUserNavbar() {
  const nav = document.createElement("nav");
  nav.className = "top-navbar";

  nav.innerHTML = `
    <button class="nav-left" onclick="goHome()" style="cursor:pointer;">
      <div class="nav-logo-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <span class="logo-text">TheDevStudio</span>
    </button>

    <div class="nav-center">
  <a onclick="goCourses()">${t("courses", "Courses")}</a>
  <a onclick="goChallenges()">${t("challenges", "Challenges")}</a>
  <a onclick="goDashboard()">${t("dashboard", "Dashboard")}</a>
  <a onclick="goProfile()">${t("profile", "Profile")}</a>
</div>

<div class="nav-actions">
  ${languageSwitcher()}
  <button class="btn-signup" onclick="logout()">${t("logout", "Logout")}</button>
</div>
  `;

  return nav;
}

async function renderNavbar() {
  await fetchCurrentUser();

  const nav = currentUser
    ? createUserNavbar()
    : createGuestNavbar();

  document.body.prepend(nav);
}

document.addEventListener("DOMContentLoaded", renderNavbar);