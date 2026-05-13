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
  signinForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    formMessage.textContent = "";

    if (!email || !password) {
      formMessage.textContent = "Please fill in all fields.";
      formMessage.style.color = "red";
      return;
    }

    formMessage.textContent = "Signing in...";
    formMessage.style.color = "#60A3A6";

    setTimeout(() => {
      window.location.href = "../student/dashboard.html";
    }, 300);
  });
}