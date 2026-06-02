// ── UPLOAD AREA ──
const uploadArea = document.getElementById('upload-area');
const fileInput  = document.getElementById('file-input');
if (uploadArea && fileInput) {
  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadArea.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
    uploadArea.style.backgroundSize = 'cover';
    uploadArea.style.backgroundPosition = 'center';
    uploadArea.querySelector('.upload-icon').style.display = 'none';
    uploadArea.querySelector('.upload-text').textContent = file.name;
    uploadArea.querySelector('.upload-hint').textContent = 'Click to change image';
  });
}

// ── EVENT DELEGATION — remove buttons ──
document.addEventListener('click', (e) => {
  // remove outcome
  if (e.target.closest('#outcomes-list .btn-remove')) {
    const item = e.target.closest('.outcome-item');
    const all  = document.querySelectorAll('#outcomes-list .outcome-item');
    if (all.length > 1) item.remove();
  }
  // remove lesson
  if (e.target.closest('.lesson-container .btn-remove')) {
    const item    = e.target.closest('.lesson-item');
    const section = e.target.closest('.section-card');
    const all     = section.querySelectorAll('.lesson-item');
    if (all.length > 1) item.remove();
  }
  // add lesson
  if (e.target.closest('.section-card .btn-add')) {
    const section = e.target.closest('.section-card');
    const si      = [...document.querySelectorAll('.section-card')].indexOf(section);
    const btn     = section.querySelector('.btn-add');
    const div     = document.createElement('div');
    div.className = 'form-group lesson-item';
    div.innerHTML = `
      <div class="outcome-item">
        <input type="text" class="form-input" name="sections[${si}][lessons][]" placeholder="Lesson title"/>
        <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>
      </div>`;
    section.insertBefore(div, btn);
    div.querySelector('.form-input').focus();
  }
});

// ── ADD OUTCOME ──
document.getElementById('add-outcome')?.addEventListener('click', () => {
  const list = document.getElementById('outcomes-list');
  const div  = document.createElement('div');
  div.className = 'outcome-item';
  div.innerHTML = `
    <input type="text" class="form-input" name="outcomes[]" placeholder="e.g., Build responsive websites"/>
    <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>`;
  list.appendChild(div);
  div.querySelector('.form-input').focus();
});

// ── ADD SECTION ──
document.getElementById('add-section')?.addEventListener('click', () => {
  const list = document.getElementById('sections-list');
  const si   = document.querySelectorAll('.section-card').length;
  const card = document.createElement('div');
  card.className = 'section-card';
  card.innerHTML = `
    <div class="form-group">
      <input type="text" class="form-input" name="sections[${si}][title]" placeholder="Section title"/>
    </div>
   <div class="lesson-container">
  <div class="lesson-item">
    <div class="lesson-row">
      <input type="text" class="form-input" name="sections[${si}][lessons][0][title]" placeholder="Lesson title"/>
      <button type="button" class="btn-icon btn-remove"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="lesson-meta-grid">
      <input type="url" class="form-input" name="sections[${si}][lessons][0][videoUrl]" placeholder="Video URL"/>
      <input type="text" class="form-input" name="sections[${si}][lessons][0][duration]" placeholder="Duration"/>
    </div>
  </div>
</div>
    <button type="button" class="btn-add">
      <i class="fa-solid fa-plus"></i> Add Lesson
    </button>`;
  list.appendChild(card);
  card.querySelector('.form-input').focus();
});
