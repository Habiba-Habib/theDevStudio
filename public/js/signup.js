
    // track selected role
    let selectedRole = 'student';

    function setRole(btn, role) {
      document.querySelectorAll('.btn-role').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = role;

      const roleInput = document.getElementById('role');
      if (roleInput) roleInput.value = role;
    }

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
    ['name', 'email', 'password'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        clearError(id, id + '-error');
      });
    });

    // email validation
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // create account — validate then redirect based on role
    document.getElementById('btn-create').addEventListener('click', () => {
      const name     = document.getElementById('name');
      const email    = document.getElementById('email');
      const password = document.getElementById('password');
      const terms    = document.getElementById('terms');
      const btn      = document.getElementById('btn-create');
      let valid = true;

      // name check
      if (!name.value.trim()) {
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

      // password check
      if (password.value.length < 6) {
        showError('password', 'password-error');
        valid = false;
      } else {
        clearError('password', 'password-error');
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

            fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value,
          role: selectedRole
        })
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Signup failed");
          }

          window.location.href = "/auth/login";
        })
        .catch((err) => {
          alert(err.message);
        });
    });
 
