// ── THUMBNAIL PREVIEW ──
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const thumbnailPreview = document.getElementById('thumbnail-preview');
const previewImage = document.getElementById('preview-image');
const changeThumbBtn = document.getElementById('change-thumbnail');

// Click to upload
uploadArea.addEventListener('click', (e) => {
  if (!e.target.closest('.btn-change-thumbnail')) {
    fileInput.click();
  }
});

// Change thumbnail button
if (changeThumbBtn) {
  changeThumbBtn.addEventListener('click', () => {
    fileInput.click();
  });
}

// File selected - show preview
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      uploadPlaceholder.style.display = 'none';
      thumbnailPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// ── CHARACTER COUNTERS ──
const shortDesc = document.getElementById('shortDescription');
const fullDesc = document.getElementById('fullDescription');
const shortCount = document.getElementById('short-count');
const descCount = document.getElementById('desc-count');

function updateCounter(input, counter, max) {
  const length = input.value.length;
  counter.textContent = length;
  
  const parent = counter.parentElement;
  parent.classList.remove('success', 'warning', 'danger');
  
  if (length < max * 0.5) {
    parent.classList.add('success');
  } else if (length < max * 0.8) {
    parent.classList.add('warning');
  } else {
    parent.classList.add('danger');
  }
}

shortDesc.addEventListener('input', () => updateCounter(shortDesc, shortCount, 150));
fullDesc.addEventListener('input', () => updateCounter(fullDesc, descCount, 1000));

// Initialize counters on page load
updateCounter(shortDesc, shortCount, 150);
updateCounter(fullDesc, descCount, 1000);

// ── AUTO-SAVE DRAFT ──
const AUTOSAVE_KEY = 'course_draft_step1';
const form = document.querySelector('form');
let autoSaveInterval;
let lastSaveTime = Date.now();

function saveDraft() {
  const formData = {
    title: document.querySelector('[name="title"]').value,
    shortDescription: shortDesc.value,
    fullDescription: fullDesc.value,
    category: document.querySelector('[name="category"]').value,
    level: document.querySelector('[name="level"]').value,
    timestamp: new Date().toISOString()
  };
  
  // Only save if there's actual content
  if (formData.title || formData.shortDescription || formData.fullDescription) {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
    lastSaveTime = Date.now();
    showSaveIndicator();
  }
}

function showSaveIndicator() {
  let indicator = document.getElementById('save-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'save-indicator';
    indicator.innerHTML = '<i class="fa-solid fa-check-circle"></i> Draft saved';
    document.body.appendChild(indicator);
  }
  
  indicator.style.opacity = '1';
  setTimeout(() => {
    indicator.style.opacity = '0';
  }, 2500);
}

// Auto-save every 45 seconds (less frequent)
autoSaveInterval = setInterval(saveDraft, 45000);

// Save on input change - but only after 5 seconds of no typing (debounced)
let saveTimeout;
form.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  formChanged = true;
  
  // Only auto-save if it's been at least 10 seconds since last save
  saveTimeout = setTimeout(() => {
    if (Date.now() - lastSaveTime > 10000) {
      saveDraft();
    }
  }, 5000);
});

// Load draft on page load
window.addEventListener('load', loadDraft);

// Clear draft on successful submit
form.addEventListener('submit', () => {
  localStorage.removeItem(AUTOSAVE_KEY);
  formChanged = false;
});


// ── EXIT WARNING ──
let formChanged = false;
form.addEventListener('input', () => {
  formChanged = true;
});

window.addEventListener('beforeunload', (e) => {
  if (formChanged) {
    e.preventDefault();
    e.returnValue = '';
  }
});
// Load existing thumbnail on page load
window.addEventListener('DOMContentLoaded', () => {
  const thumbnailUrl = '<%= formData.thumbnail || "" %>';
  if (thumbnailUrl && thumbnailUrl.trim()) {
    previewImage.src = thumbnailUrl;
    uploadPlaceholder.style.display = 'none';
    thumbnailPreview.style.display = 'block';
  }
});
