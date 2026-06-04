// Thumbnail upload preview
const uploadArea = document.getElementById('upload-area');
const thumbnailInput = document.getElementById('file-input');

if (uploadArea && thumbnailInput) {
  uploadArea.addEventListener('click', () => thumbnailInput.click());

  thumbnailInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    let previewImg = document.querySelector('.thumbnail-preview img');

    if (!previewImg) {
      const preview = document.createElement('div');
      preview.className = 'thumbnail-preview';
      preview.innerHTML = `<img src="${url}" alt="Course thumbnail preview" />`;
      uploadArea.parentNode.insertBefore(preview, uploadArea);
      return;
    }

    previewImg.src = url;
  });
}

// Outcomes
const outcomesList = document.getElementById('outcomes-list');
const addOutcomeBtn = document.getElementById('add-outcome');

if (addOutcomeBtn && outcomesList) {
  addOutcomeBtn.addEventListener('click', () => {
    const item = document.createElement('div');
    item.className = 'outcome-item';
    item.innerHTML = `
      <input type="text" class="form-input" name="outcomes[]" placeholder="e.g. Build responsive websites" />
      <button type="button" class="btn-icon btn-remove" onclick="removeOutcome(this)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    outcomesList.appendChild(item);
    item.querySelector('input').focus();
  });
}

window.removeOutcome = function (button) {
  const item = button.closest('.outcome-item');
  if (!item || !outcomesList) return;

  if (outcomesList.querySelectorAll('.outcome-item').length > 1) {
    item.remove();
  }
};

// Toggle section open/closed
window.toggleSection = function (button) {
  const sectionCard = button.closest('.section-card');
  if (!sectionCard) return;

  const content = sectionCard.querySelector('.section-content');
  const icon = button.querySelector('i');

  button.classList.toggle('collapsed');
  content?.classList.toggle('collapsed');

  if (icon) {
    icon.classList.toggle('fa-chevron-right');
    icon.classList.toggle('fa-chevron-down');
  }
};

// Toggle lesson open/closed
window.toggleLesson = function (button) {
  const lessonItem = button.closest('.lesson-item');
  if (!lessonItem) return;

  const content = lessonItem.querySelector('.lesson-content');
  const icon = button.querySelector('i');

  button.classList.toggle('collapsed');
  content?.classList.toggle('collapsed');

  if (icon) {
    icon.classList.toggle('fa-chevron-right');
    icon.classList.toggle('fa-chevron-down');
  }
};

// Video source URL/upload switch
window.toggleVideoSource = function (select) {
  const videoItem = select.closest('.video-item');
  if (!videoItem) return;

  const urlInput = videoItem.querySelector('.video-url-input');
  const fileInput = videoItem.querySelector('.video-file-input');

  if (select.value === 'upload') {
    urlInput?.classList.add('hidden');
    fileInput?.classList.remove('hidden');
  } else {
    urlInput?.classList.remove('hidden');
    fileInput?.classList.add('hidden');
  }
};

// Sections
const sectionsContainer = document.getElementById('sections-container');
const addSectionBtn = document.getElementById('add-section');

function getNextSectionIndex() {
  const indexes = [...document.querySelectorAll('.section-card')]
    .map(section => Number(section.dataset.sectionIndex))
    .filter(Number.isFinite);

  return indexes.length ? Math.max(...indexes) + 1 : 0;
}

function getNextLessonIndex(sectionCard) {
  const indexes = [...sectionCard.querySelectorAll('.lesson-item')]
    .map(lesson => Number(lesson.dataset.lessonIndex))
    .filter(Number.isFinite);

  return indexes.length ? Math.max(...indexes) + 1 : 0;
}

if (addSectionBtn && sectionsContainer) {
  addSectionBtn.addEventListener('click', () => {
    const sectionIndex = getNextSectionIndex();

    const sectionCard = document.createElement('div');
    sectionCard.className = 'section-card';
    sectionCard.dataset.sectionIndex = sectionIndex;

    sectionCard.innerHTML = `
      <div class="section-header-row">
        <button type="button" class="btn-toggle-section" onclick="toggleSection(this)">
          <i class="fa-solid fa-chevron-down"></i>
        </button>

        <input
          type="text"
          class="form-input section-title-input"
          name="sections[${sectionIndex}][title]"
          placeholder="Section title"
        />

        <button type="button" class="btn-icon btn-remove-section" onclick="removeSection(this)">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>

      <div class="section-content">
        <div class="lessons-container">
          ${createLessonHtml(sectionIndex, 0)}
        </div>

        <button type="button" class="btn-add-lesson" onclick="addLesson(this)">
          <i class="fa-solid fa-plus"></i>
          Add Lesson
        </button>
      </div>
    `;

    sectionsContainer.appendChild(sectionCard);
    sectionCard.querySelector('.section-title-input').focus();
  });
}

window.removeSection = function (button) {
  const sectionCard = button.closest('.section-card');
  if (!sectionCard || !sectionsContainer) return;

  if (sectionsContainer.querySelectorAll('.section-card').length > 1) {
    sectionCard.remove();
  }
};

function createLessonHtml(sectionIndex, lessonIndex) {
  return `
    <div class="lesson-item" data-lesson-index="${lessonIndex}">
      <div class="lesson-header">
        <button type="button" class="btn-toggle-lesson" onclick="toggleLesson(this)">
          <i class="fa-solid fa-chevron-down"></i>
        </button>

        <input
          type="text"
          class="form-input lesson-title-input"
          name="sections[${sectionIndex}][lessons][${lessonIndex}][title]"
          placeholder="Lesson title"
        />

        <button type="button" class="btn-icon btn-remove-lesson" onclick="removeLesson(this)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="lesson-content">
        <div class="lesson-subsection">
          <h4><i class="fa-solid fa-file-lines"></i> Documents</h4>
          <input
            type="file"
            class="form-input"
            name="sections_${sectionIndex}_lessons_${lessonIndex}_resourceFile"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
          />
          <input
            type="hidden"
            name="sections[${sectionIndex}][lessons][${lessonIndex}][existingResourceFile]"
            value=""
          />
        </div>

        <div class="lesson-subsection">
          <h4><i class="fa-solid fa-clipboard-list"></i> Assignment / Quiz</h4>
          <input
            type="file"
            class="form-input"
            name="sections_${sectionIndex}_lessons_${lessonIndex}_assignmentFile"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
          />
          <input
            type="hidden"
            name="sections[${sectionIndex}][lessons][${lessonIndex}][existingAssignmentFile]"
            value=""
          />
        </div>

        <div class="lesson-subsection">
          <h4>Video</h4>

          <div class="video-item">
            <select
              class="form-input video-source"
              name="sections[${sectionIndex}][lessons][${lessonIndex}][videoSource]"
              onchange="toggleVideoSource(this)"
            >
              <option value="url">Video URL</option>
              <option value="upload">Upload File</option>
            </select>

            <div class="video-url-input">
              <input
                type="url"
                class="form-input"
                name="sections[${sectionIndex}][lessons][${lessonIndex}][videoUrl]"
                placeholder="YouTube, Vimeo, or direct video URL"
              />
            </div>

            <div class="video-file-input hidden">
              <input
                type="file"
                class="form-input"
                name="sections_${sectionIndex}_lessons_${lessonIndex}_videoFile"
                accept="video/*"
              />
            </div>

            <input
              type="hidden"
              name="sections[${sectionIndex}][lessons][${lessonIndex}][existingVideoFile]"
              value=""
            />

            <input
              type="text"
              class="form-input"
              name="sections[${sectionIndex}][lessons][${lessonIndex}][duration]"
              placeholder="Duration, e.g. 10:30"
            />
          </div>
        </div>
      </div>
    </div>
  `;
}

window.addLesson = function (button) {
  const sectionCard = button.closest('.section-card');
  if (!sectionCard) return;

  const lessonsContainer = sectionCard.querySelector('.lessons-container');
  const sectionIndex = sectionCard.dataset.sectionIndex;
  const lessonIndex = getNextLessonIndex(sectionCard);

  lessonsContainer.insertAdjacentHTML('beforeend', createLessonHtml(sectionIndex, lessonIndex));

  const newLesson = lessonsContainer.lastElementChild;
  newLesson.querySelector('.lesson-title-input')?.focus();
};

window.removeLesson = function (button) {
  const lessonItem = button.closest('.lesson-item');
  const lessonsContainer = lessonItem?.closest('.lessons-container');

  if (!lessonItem || !lessonsContainer) return;

  if (lessonsContainer.querySelectorAll('.lesson-item').length > 1) {
    lessonItem.remove();
  }
};
// Check for saved query parameter and show popup
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('saved')) {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.classList.add('show');
      modal.classList.remove('hidden');
    }
  }
});


// ── SHOW PREMIUM SAVING STATE ON BUTTON SUBMIT ──
// This uses the browser's native submit (100% reliable) while giving beautiful visual feedback!
document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('editCourseForm');
  if (editForm) {
    editForm.addEventListener('submit', () => {
      const saveBtn = editForm.querySelector('.btn-primary');
      if (saveBtn) {
        saveBtn.disabled = true; // Prevents double submissions
        saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
      }
    });
  }

  // ── TRIGGER THE SUCCESS MODAL IF URL HAS ?saved=true ──
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('saved')) {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.classList.add('show');
      modal.classList.remove('hidden');
    }
  }
});

// ── CLOSE SUCCESS MODAL & STRIP QUERY PARAMETER CLEANLY ──
window.closeSuccessModal = function() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.remove('show');
    
    // Wipe ?saved=true from address bar without reloading
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    setTimeout(() => modal.classList.add('hidden'), 300);
  }
};

window.extractVideoDuration = function(input) {
  const file = input.files[0];
  if (!file) return;

  const lessonContent = input.closest('.lesson-content');
  const hiddenDuration = lessonContent.querySelector('.lesson-duration-hidden');

  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  const objectUrl = URL.createObjectURL(file);
  tempVideo.src = objectUrl;

  tempVideo.onloadedmetadata = function() {
    URL.revokeObjectURL(objectUrl);
    const totalSeconds = Math.floor(tempVideo.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted = minutes + ':' + seconds.toString().padStart(2, '0');

    if (hiddenDuration) hiddenDuration.value = formatted;

    // Show a confirmation label
    let display = lessonContent.querySelector('.duration-display');
    if (!display) {
      display = document.createElement('p');
      display.className = 'duration-display saved-file';
      input.parentNode.appendChild(display);
    }
    display.innerHTML = '<i class="fa-solid fa-clock"></i> Duration: <strong>' + formatted + '</strong>';
  };
};


