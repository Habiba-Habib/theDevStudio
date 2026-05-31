// ── CATEGORY SELECTION ──
const selectedCategories = [];

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const cat = this.dataset.cat;
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      const idx = selectedCategories.indexOf(cat);
      if (idx !== -1) selectedCategories.splice(idx, 1);
    } else {
      this.classList.add('selected');
      selectedCategories.push(cat);
    }
    if (selectedCategories.length > 0) hideError('categories-error');
  });
});

// ── HELPERS ──
function showError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (field) field.classList.add('error');
  if (error) error.classList.add('show');
}

function hideError(errorId) {
  const error = document.getElementById(errorId);
  if (error) error.classList.remove('show');
}

function shakeBtn(id) {
  const btn = document.getElementById(id);
  btn.style.transform = 'translateX(-6px)';
  setTimeout(() => btn.style.transform = 'translateX(6px)', 100);
  setTimeout(() => btn.style.transform = 'translateX(0)',   200);
}

// ── CLEAR ERRORS ON INPUT ──
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('input', () => input.classList.remove('error'));
  input.addEventListener('change', () => input.classList.remove('error'));
});


// ── STEP 1 VALIDATION ──
document.getElementById('btn-continue-1').addEventListener('click', () => {
  let valid = true;

  const fields = [
    { id: 'full-name',  errorId: 'full-name-error' },
    { id: 'job-title',  errorId: 'job-title-error' },
    { id: 'expertise',  errorId: 'expertise-error' },
    { id: 'experience', errorId: 'experience-error' },
    { id: 'bio',        errorId: 'bio-error' },
  ];

  fields.forEach(({ id, errorId }) => {
    const field = document.getElementById(id);
    if (!field || !field.value.trim()) {
      showError(id, errorId);
      valid = false;
    } else {
      hideError(errorId);
    }
  });

  if (selectedCategories.length === 0) {
    document.getElementById('categories-error').classList.add('show');
    valid = false;
  } else {
    document.getElementById('categories-error').classList.remove('show');
  }

  if (!valid) {
    shakeBtn('btn-continue-1');
    const firstError = document.querySelector('.error-msg.show');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = document.getElementById('btn-continue-1');
  btn.disabled = true;

  document.getElementById('categories-hidden').value = selectedCategories.join(',');
  document.getElementById('section-1').submit();

});
// Re-select category buttons after server validation error
// Re-select category buttons after server validation error (value from hidden input)
const savedCats = (document.getElementById('categories-hidden')?.value || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

savedCats.forEach((cat) => {
  const btn = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
  if (btn && !btn.classList.contains('selected')) {
    btn.classList.add('selected');
    if (!selectedCategories.includes(cat)) selectedCategories.push(cat);
  }
});
if (selectedCategories.length) {
  document.getElementById('categories-hidden').value = selectedCategories.join(',');
}


