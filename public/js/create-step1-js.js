// ── UPLOAD AREA ──
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');

// click to open file picker
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// when file is selected show preview
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadArea.style.backgroundImage = `url(${e.target.result})`;
    uploadArea.style.backgroundSize = 'cover';
    uploadArea.style.backgroundPosition = 'center';
    uploadArea.querySelector('.upload-icon').style.display = 'none';
    uploadArea.querySelector('.upload-text').textContent = file.name;
    uploadArea.querySelector('.upload-hint').textContent = 'Click to change image';
  };
  reader.readAsDataURL(file);
});

// drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--pink)';
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.borderColor = 'rgba(255,255,255,0.2)';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  fileInput.files = e.dataTransfer.files;
  fileInput.dispatchEvent(new Event('change'));
});

// ── FORM VALIDATION & NAVIGATION ──
const nextBtn = document.querySelector('.btn-enroll');

nextBtn.addEventListener('click', () => {
  // get all required fields
  const title = document.querySelector('input[placeholder="e.g., Complete Web Development Bootcamp"]');
  const shortDesc = document.querySelector('input[placeholder="Brief one-line description"]');
  const fullDesc = document.querySelector('textarea');

  // check if empty
  let valid = true;

  [title, shortDesc, fullDesc].forEach(field => {
    if (!field.value.trim()) {
      // highlight empty fields in pink
      field.style.borderColor = 'var(--pink)';
      field.style.boxShadow = '0 0 0 3px rgba(255,64,160,0.2)';
      valid = false;
    } else {
      // reset if filled
      field.style.borderColor = 'var(--border)';
      field.style.boxShadow = 'none';
    }
  });

  if (!valid) {
    // shake the button to indicate error
    nextBtn.style.transform = 'translateX(-6px)';
    setTimeout(() => nextBtn.style.transform = 'translateX(6px)', 100);
    setTimeout(() => nextBtn.style.transform = 'translateX(0)', 200);
    return;
  }


});

// ── CLEAR ERROR ON TYPING ──
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('input', () => {
    input.style.borderColor = 'var(--border)';
    input.style.boxShadow = 'none';
  });
});