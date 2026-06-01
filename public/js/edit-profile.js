
function initAvatarSelection() {
    const avatars = document.querySelectorAll('.grid-avatars img');
    const selectedImg = document.getElementById('selected-img');
    if (!avatars.length || !selectedImg) return;

    avatars.forEach(avatar => {
        avatar.addEventListener('click', () => {
            avatars.forEach(a => a.classList.remove('active'));
            avatar.classList.add('active');
            selectedImg.src = avatar.src;
            selectedImg.alt = avatar.alt;
            const avatarInput = document.getElementById('avatar');
            if (avatarInput) {
                avatarInput.value = avatar.src.split('/').pop();
            }
        });
    });

    const currentAvatar = selectedImg.src.split('/').pop();
    const activeAvatar = Array.from(avatars).find(avatar => avatar.src.split('/').pop() === currentAvatar);
    (activeAvatar || avatars[0]).classList.add('active');
}


function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input-error');
    const span = input.closest('.field-group').querySelector('.error-msg');
    if (span) span.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-msg').forEach(span => span.textContent = '');
}


function validatePasswords() {
    const current = document.getElementById('currentpass').value.trim();
    const newPass  = document.getElementById('newpass').value.trim();
    const confirm  = document.getElementById('confirmpass').value.trim();

    clearErrors();

    if (!current && !newPass && !confirm) return true;

    let valid = true;

    if (!current) {
        showError('currentpass', 'Please enter your current password.');
        valid = false;
    }

    if (!newPass) {
        showError('newpass', 'Please enter a new password.');
        valid = false;
    } else if (newPass.length < 8) {
        showError('newpass', 'Password must be at least 8 characters.');
        valid = false;
    } else if (current && current === newPass) {
        showError('newpass', 'New password must differ from current password.');
        valid = false;
    }

    if (!confirm) {
        showError('confirmpass', 'Please confirm your new password.');
        valid = false;
    } else if (newPass && confirm !== newPass) {
        showError('confirmpass', 'Passwords do not match.');
        valid = false;
    }

    return valid;
}


function initSaveButton() {
    const saveBtn = document.querySelector('.save-bttn');
    if (!saveBtn) return;

    saveBtn.removeAttribute('onclick');
    saveBtn.addEventListener('click', (event) => {
        if (!validatePasswords()) {
            event.preventDefault();
        }
    });
}

function initCancelButton() {
    const cancelBtn = document.getElementById('cancel-bttn');
    const form = document.querySelector('form[action$="/edit-profile"]');

    if (!cancelBtn || !form) return;

    cancelBtn.addEventListener('click', () => {
        const action = form.getAttribute('action');

        if (action.startsWith('/instructor')) {
            window.location.href = '/instructor/profile';
        } else if (action.startsWith('/student')) {
            window.location.href = '/student/profile';
        } else if (action.startsWith('/admin')) {
            window.location.href = '/admin/profile';
        } else {
            window.location.href = '/dashboard';
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    initAvatarSelection();
    initSaveButton();
    initCancelButton();
});
