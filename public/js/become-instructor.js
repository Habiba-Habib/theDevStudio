// ── STATE ──
let selectedCategories = [];

// ── CATEGORY BUTTONS ── (only once!)
document.querySelectorAll('.cat-btn').forEach(function(btn) {
  btn.onclick = function() {
    const cat = this.dataset.cat;
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      selectedCategories = selectedCategories.filter(c => c !== cat);
    } else {
      this.classList.add('selected');
      selectedCategories.push(cat);
    }
  };
});

// ── UPLOAD AREAS ──
function setupUpload(areaId, inputId, errorId) {
  const area  = document.getElementById(areaId);
  const input = document.getElementById(inputId);

  area.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    area.querySelector('.upload-text').textContent = file.name;
    area.querySelector('.upload-hint').textContent = 'Click to change file';
    area.querySelector('.upload-icon').className   = 'fa-solid fa-check upload-icon';
    area.classList.add('uploaded');
    hideError(errorId);
  });

  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.style.borderColor = 'var(--pink)';
  });

  area.addEventListener('dragleave', () => {
    area.style.borderColor = '';
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (!file) return;
    input.files = e.dataTransfer.files;
    input.dispatchEvent(new Event('change'));
  });
}

setupUpload('upload-id',   'file-id',   'file-id-error');
setupUpload('upload-cert', 'file-cert', 'file-cert-error');

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

// ── STEPPER NAVIGATION ──
function goToStep(step) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`section-${step}`).classList.remove('hidden');

  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    stepEl.classList.remove('active', 'done', 'inactive');
    if (i < step)        stepEl.classList.add('done');
    else if (i === step) stepEl.classList.add('active');
    else                 stepEl.classList.add('inactive');
  }

  for (let i = 1; i <= 2; i++) {
    const line = document.getElementById(`line-${i}`);
    line.classList.toggle('done', i < step);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
    if (!field.value.trim()) {
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
    return;
  }

  goToStep(2);
});

// ── STEP 2 VALIDATION ──
document.getElementById('btn-continue-2').addEventListener('click', () => {
  let valid = true;

  if (!document.getElementById('file-id').files.length) {
    document.getElementById('file-id-error').classList.add('show');
    valid = false;
  }

  if (!document.getElementById('file-cert').files.length) {
    document.getElementById('file-cert-error').classList.add('show');
    valid = false;
  }

  if (!valid) {
    shakeBtn('btn-continue-2');
    return;
  }

  buildReview();
  goToStep(3);
});

// ── BACK BUTTONS ──
document.getElementById('btn-back-2').addEventListener('click', () => goToStep(1));
document.getElementById('btn-back-3').addEventListener('click', () => goToStep(2));

// ── BUILD REVIEW ──
function buildReview() {
  const grid = document.getElementById('review-grid');
  grid.innerHTML = '';

  const items = [
    { label: 'Full Name',           value: document.getElementById('full-name').value },
    { label: 'Job Title',           value: document.getElementById('job-title').value },
    { label: 'Primary Expertise',   value: document.getElementById('expertise').value },
    { label: 'Years of Experience', value: document.getElementById('experience').value },
    { label: 'Teaching Categories', value: selectedCategories.join(', '), full: true },
    { label: 'Professional Bio',    value: document.getElementById('bio').value, full: true },
    { label: 'ID Document',         value: document.getElementById('file-id').files[0]?.name || 'Uploaded' },
    { label: 'Certificate',         value: document.getElementById('file-cert').files[0]?.name || 'Uploaded' },
  ];

  items.forEach(({ label, value, full }) => {
    const div = document.createElement('div');
    div.className = `review-item${full ? ' full-width' : ''}`;
    div.innerHTML = `
      <div class="review-item-label">${label}</div>
      <div class="review-item-value">${value}</div>
    `;
    grid.appendChild(div);
  });
}

// ── SUBMIT ──
document.getElementById('btn-submit').addEventListener('click', () => {
  const btn = document.getElementById('btn-submit');
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Application Submitted!';
  btn.style.background = 'linear-gradient(90deg, var(--teal), var(--yellow))';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = '../../pages/instructor/dashboard.html';
  }, 2000);
});

// ── SHAKE ANIMATION ──
function shakeBtn(id) {
  const btn = document.getElementById(id);
  btn.style.transform = 'translateX(-6px)';
  setTimeout(() => btn.style.transform = 'translateX(6px)', 100);
  setTimeout(() => btn.style.transform = 'translateX(0)',   200);
}

// ── CLEAR ERRORS ON INPUT ──
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('error');
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".cat-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
    });
  });
});