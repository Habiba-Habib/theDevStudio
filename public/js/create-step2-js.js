// ── ADD LEARNING OUTCOME ──
document.getElementById('add-outcome').addEventListener('click', () => {
  const list = document.getElementById('outcomes-list');
  const item = document.createElement('div');
  item.className = 'outcome-item';
  item.innerHTML = `
    <input type="text" class="form-input" name="outcomes[]" placeholder="e.g., Build responsive websites"/>
    <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>
  `;
  item.querySelector('.btn-remove').addEventListener('click', () => {
    if (document.querySelectorAll('.outcome-item').length > 1) {
      item.remove();
    }
  });
  list.appendChild(item);
  item.querySelector('.form-input').focus();
});

// remove button for first outcome
document.querySelector('.outcome-item .btn-remove').addEventListener('click', function () {
  if (document.querySelectorAll('.outcome-item').length > 1) {
    this.closest('.outcome-item').remove();
  }
});

// ── ADD LESSON inside a section ──
function addLessonToSection(section) {
  const addLessonBtn = section.querySelector('.btn-add');
  const sectionIndex = [...document.querySelectorAll('.section-card')].indexOf(section);
  const lessonInput = document.createElement('div');
  lessonInput.className = 'form-group lesson-item';
  lessonInput.innerHTML = `
    <div class="outcome-item">
      <input type="text" class="form-input" name="sections[${sectionIndex}][lessons][]" placeholder="Lesson title"/>
      <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `;
  lessonInput.querySelector('.btn-remove').addEventListener('click', () => {
    lessonInput.remove();
  });
  section.insertBefore(lessonInput, addLessonBtn);
  lessonInput.querySelector('.form-input').focus();
}

// attach add lesson to first section
document.querySelector('.section-card .btn-add').addEventListener('click', function () {
  addLessonToSection(this.closest('.section-card'));
});

// ── ADD SECTION ──
document.getElementById('add-section').addEventListener('click', () => {
  const list = document.getElementById('sections-list');
  const sectionIndex = document.querySelectorAll('.section-card').length;
  const card = document.createElement('div');
  card.className = 'section-card';
  card.innerHTML = `
    <div class="form-group">
      <input type="text" class="form-input" name="sections[${sectionIndex}][title]" placeholder="Section title"/>
    </div>
    <div class="lesson-container">
      <div class="form-group lesson-item">
        <div class="outcome-item">
          <input type="text" class="form-input" name="sections[${sectionIndex}][lessons][]" placeholder="Lesson title"/>
          <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
    </div>
    <button type="button" class="btn-add">
      <i class="fa-solid fa-plus"></i> Add Lesson
    </button>
  `;
  card.querySelector('.btn-add').addEventListener('click', function () {
    addLessonToSection(card);
  });
  card.querySelector('.btn-remove').addEventListener('click', function () {
    this.closest('.outcome-item').remove();
  });
  list.appendChild(card);
  card.querySelector('.form-input').focus();
});

// ── FORM VALIDATION — runs before submit ──
document.getElementById('courseForm').addEventListener('submit', (e) => {
  let valid = true;

  // check at least one outcome is filled
  document.querySelectorAll('.outcome-item .form-input').forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--pink)';
      input.style.boxShadow = '0 0 0 3px rgba(255,64,160,0.2)';
      valid = false;
    }
  });

  // check all section titles are filled
  document.querySelectorAll('.section-card > .form-group:first-child .form-input').forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--pink)';
      input.style.boxShadow = '0 0 0 3px rgba(255,64,160,0.2)';
      valid = false;
    }
  });

  if (!valid) {
    e.preventDefault(); // stop form submit
    const btn = document.querySelector('.btn-enroll');
    btn.style.transform = 'translateX(-6px)';
    setTimeout(() => btn.style.transform = 'translateX(6px)', 100);
    setTimeout(() => btn.style.transform = 'translateX(0)', 200);
  }
});

// ── CLEAR ERRORS ON TYPING ──
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('form-input')) {
    e.target.style.borderColor = '';
    e.target.style.boxShadow = '';
  }
});
