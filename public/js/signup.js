

    // password toggle
    const togglePw = document.getElementById('toggle-pw');

    if (togglePw) {
      togglePw.addEventListener('click', () => {
        const pw = document.getElementById('password');
        const icon = document.querySelector('#toggle-pw i');

        if (pw.type === 'password') {
          pw.type = 'text';
          if (icon) icon.className = 'fa-regular fa-eye-slash';
        } else {
          pw.type = 'password';
          if (icon) icon.className = 'fa-regular fa-eye';
        }
      });
    }

    // validation helpers
    function showError(fieldId, errorId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(errorId);

      if (field) field.classList.add('error');
      if (error) error.classList.add('show');
    }

    function clearError(fieldId, errorId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(errorId);

      if (field) field.classList.remove('error');
      if (error) error.classList.remove('show');
    }

    // clear errors on typing
   ['name', 'email', 'password', 'confirm-password'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        clearError(id, id + '-error');
      });
    });
    document.getElementById('terms').addEventListener('change', () => {
  const terms = document.getElementById('terms');
  const termsError = document.getElementById('terms-error');

  if (terms.checked && termsError) {
    termsError.classList.remove('show');
  }
});

    document.querySelectorAll('.btn-toggle-pw').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    const icon = button.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fa-regular fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fa-regular fa-eye';
    }
  });
});

    // email validation
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function isValidName(name) {
  return /^[A-Za-z\s]{2,}$/.test(name.trim());
}

    // create account — validate then redirect based on role
    document.getElementById('btn-create').addEventListener('click', () => {
      const name     = document.getElementById('name');
      const email    = document.getElementById('email');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirm-password');
      const terms    = document.getElementById('terms');
      const btn      = document.getElementById('btn-create');
      let valid = true;

      // name check
      if (!isValidName(name.value)) {
        showError('name', 'name-error');
        valid = false;
      } else {
        clearError('name', 'name-error');
      }

      // email check
      if (!email.value.trim() || !isValidEmail(email.value)) {
        showError('email', 'email-error');
        valid = false;
      } else {
        clearError('email', 'email-error');
      }
      function isStrongPassword(password) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

      // password check
     if (!isStrongPassword(password.value)) {
  showError('password', 'password-error');
  valid = false;
} else {
  clearError('password', 'password-error');
}

      if (confirmPassword.value !== password.value) {
  showError('confirm-password', 'confirm-password-error');
  valid = false;
} else {
  clearError('confirm-password', 'confirm-password-error');
}

      // terms check
      const termsError = document.getElementById('terms-error');

      if (!terms.checked) {
        if (termsError) termsError.classList.add('show');
        valid = false;
      } else {
        if (termsError) termsError.classList.remove('show');
      }

      if (!valid) {
        // shake button
        btn.style.transform = 'translateX(-6px)';
        setTimeout(() => btn.style.transform = 'translateX(6px)', 100);
        setTimeout(() => btn.style.transform = 'translateX(0)', 200);
        return;
      }
      function showSignupPopup(type, title, message, redirect = false) {
  const popup = document.getElementById('signup-popup');
  const icon = document.getElementById('signup-popup-icon');
  const titleEl = document.getElementById('signup-popup-title');
  const messageEl = document.getElementById('signup-popup-message');

  titleEl.textContent = title;
  messageEl.textContent = message;

  icon.classList.toggle('error', type === 'error');
  icon.innerHTML = type === 'error'
    ? '<i class="fa-solid fa-circle-exclamation"></i>'
    : '<i class="fa-solid fa-circle-check"></i>';

  popup.classList.remove('hidden');

  if (redirect) {
    setTimeout(() => {
      window.location.href = redirect;
    }, 1800);
  }
}

            fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
  name: name.value.trim(),
  email: email.value.trim(),
  password: password.value,
  role: 'student'      
})
      })
   .then(async (res) => {
  const data = await res.json();

  if (!res.ok) {
    showSignupPopup(
      'error',
      'Account Already Exists',
      'This email is already registered. Taking you to the login page…',
      '/auth/login'
    );
    return;
  }

  window.location.href = data.redirectUrl;
})
.catch(() => {
  showSignupPopup(
    'error',
    'Connection Error',
    'Could not connect to the server. Please try again.',
    false
  );
});
    });
 
function setupLegalModal(modalId, openBtnId, closeBtnIds) {
  const modal = document.getElementById(modalId);
  const openBtn = document.getElementById(openBtnId);

  function closeModal() {
    modal?.classList.add("hidden");
    modal?.setAttribute("aria-hidden", "true");
  }

  openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal?.classList.remove("hidden");
    modal?.setAttribute("aria-hidden", "false");
  });

  closeBtnIds.forEach((id) => {
    document.getElementById(id)?.addEventListener("click", closeModal);
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

setupLegalModal("terms-modal", "open-terms", ["terms-modal-close", "terms-modal-close-btn"]);
setupLegalModal("privacy-modal", "open-privacy", ["privacy-modal-close", "privacy-modal-close-btn"]);