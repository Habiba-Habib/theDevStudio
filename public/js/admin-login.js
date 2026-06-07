const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const toggleAdminPassword = document.getElementById("toggleAdminPassword");
const rememberMe = document.querySelector('input[name="rememberMe"]').checked;


[adminEmail, adminPassword].forEach((input) => {
  input.addEventListener("input", () => {
    input.closest(".input-box").classList.remove("error");
    adminLoginMessage.textContent = "";
  });
});

if (toggleAdminPassword && adminPassword) {
  toggleAdminPassword.addEventListener("click", () => {
    const isHidden = adminPassword.type === "password";
    adminPassword.type = isHidden ? "text" : "password";

    toggleAdminPassword.innerHTML = isHidden
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = adminEmail.value.trim();
    const password = adminPassword.value.trim();

    adminLoginMessage.textContent = "";

   adminEmail.closest(".input-box").classList.remove("error");
adminPassword.closest(".input-box").classList.remove("error");

if (!email || !password) {
  adminLoginMessage.textContent = "Please fill in all fields.";
  adminLoginMessage.style.color = "#60A3A6";

  if (!email) adminEmail.closest(".input-box").classList.add("error");
  if (!password) adminPassword.closest(".input-box").classList.add("error");

  return;
}

    try {
      adminLoginMessage.textContent = "Checking administrator access...";
      adminLoginMessage.style.color = "#60A3A6";

      const res = await fetch("/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      adminLoginMessage.textContent = err.message;
      adminLoginMessage.style.color = "#ff4f9a";
    }
  });
}