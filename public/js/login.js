const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const signinForm = document.getElementById("signinForm");
const formMessage = document.getElementById("form-message");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePassword.innerHTML = isHidden
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';
  });
}

if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();


    formMessage.textContent = "";

    if (!email || !password ) {
      formMessage.textContent = "Please fill in all fields.";
      formMessage.style.color = "red";
      return;
    }

    try {
      formMessage.textContent = "Logging in...";
      formMessage.style.color = "#60A3A6";

      const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password})
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const dashboards = {
        student: "/student/dashboard",
        instructor: "/instructor/dashboard",
        admin: "/admin/dashboard"
      };

      window.location.href = dashboards[data.user.role] || "/";
    } catch (err) {
      formMessage.textContent = err.message;
      formMessage.style.color = "red";
    }
  });
}
fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
.then(response => response.json())
.then(data => {
  if (data.message === 'Login successful') {
    window.location.href = data.redirectUrl;
  } else {
    alert(data.message);
  }
});