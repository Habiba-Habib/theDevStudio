const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const signinForm = document.getElementById("signinForm");
const formMessage = document.getElementById("form-message");


const emailInput = document.getElementById("email");

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("error");
    formMessage.textContent = "";
  });
});

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

  const email = emailInput.value.trim();
const password = passwordInput.value.trim();


    formMessage.textContent = "";

   emailInput.classList.remove("error");
passwordInput.classList.remove("error");

if (!email || !password) {
  formMessage.textContent = "Please fill in all fields.";
  formMessage.style.color = "#FF40A0";

  if (!email) emailInput.classList.add("error");
  if (!password) passwordInput.classList.add("error");

  return;
}

    try {
      formMessage.textContent = "Logging in...";
      formMessage.style.color = "#FF40A0";

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

      window.location.href = data.redirectUrl;

   
    } catch (err) {
      formMessage.textContent = err.message;
      formMessage.style.color = "red";
    }
  });
}