// ══════════════════════════════════════════════════════════════
// OUTCOMES
// ══════════════════════════════════════════════════════════════

let outcomeCount = 1;
const MAX_OUTCOMES = 10;

document.getElementById('add-outcome').addEventListener('click', () => {
  if (outcomeCount >= MAX_OUTCOMES) {
    alert(`Maximum ${MAX_OUTCOMES} learning outcomes allowed`);
    return;
  }
  
  const list = document.getElementById('outcomes-list');
  const item = document.createElement('div');
  item.className = 'outcome-item';
  item.innerHTML = `
    <input type="text" class="form-input" name="outcomes[]" placeholder="e.g., Build responsive websites"/>
    <button type="button" class="btn-remove-outcome"><i class="fa-solid fa-xmark"></i></button>
  `;
  
  item.querySelector('.btn-remove-outcome').addEventListener('click', () => {
    if (document.querySelectorAll('.outcome-item').length > 1) {
      item.remove();
      outcomeCount--;
    }
  });
  
  list.appendChild(item);
  item.querySelector('.form-input').focus();
  outcomeCount++;
});

// First outcome remove button
document.querySelector('.outcome-item .btn-remove-outcome')?.addEventListener('click', function() {
  if (document.querySelectorAll('.outcome-item').length > 1) {
    this.closest('.outcome-item').remove();
    outcomeCount--;
  }
});

// ══════════════════════════════════════════════════════════════
// FILE UPLOAD HANDLERS
// ══════════════════════════════════════════════════════════════

function setupFileUpload(lessonBox) {
  // Video file upload
  const videoBox = lessonBox.querySelector('.video-file-box');
  const videoInput = lessonBox.querySelector('.video-file-input');
  const videoDisplay = videoBox.querySelector('.file-display');
  const videoFileName = videoBox.querySelector('.file-name');
  const videoClearBtn = videoBox.querySelector('.btn-clear-file');
  
  videoDisplay.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-clear-file') && !e.target.closest('.btn-clear-file')) {
      videoInput.click();
    }
  });
  
  videoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      videoFileName.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${file.name} (${sizeMB} MB)`;
      videoBox.classList.add('file-selected');
      videoClearBtn.style.display = 'flex';
    }
  });
  
  videoClearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    videoInput.value = '';
    videoFileName.innerHTML = 'Choose Video File';
    videoBox.classList.remove('file-selected');
    videoClearBtn.style.display = 'none';
  });
  
  // Document file upload
  const docBox = lessonBox.querySelector('.doc-file-box');
  const docInput = lessonBox.querySelector('.doc-file-input');
  const docDisplay = docBox.querySelector('.file-display');
  const docFileName = docBox.querySelector('.file-name');
  const docClearBtn = docBox.querySelector('.btn-clear-file');
  
  docDisplay.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-clear-file') && !e.target.closest('.btn-clear-file')) {
      docInput.click();
    }
  });
  
  docInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      docFileName.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${file.name}`;
      docBox.classList.add('file-selected');
      docClearBtn.style.display = 'flex';
    }
  });
  
  docClearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    docInput.value = '';
    docFileName.innerHTML = 'Add Document (Optional)';
    docBox.classList.remove('file-selected');
    docClearBtn.style.display = 'none';
  });
  
  // Video source toggle
  const radios = lessonBox.querySelectorAll('[name*="videoSource"]');
  const urlInput = lessonBox.querySelector('.video-url-input');
  
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'url') {
        urlInput.style.display = 'block';
        videoBox.style.display = 'none';
      } else {
        urlInput.style.display = 'none';
        videoBox.style.display = 'flex';
      }
    });
  });
}

// ══════════════════════════════════════════════════════════════
// ADD LESSON
// ══════════════════════════════════════════════════════════════

function addLesson(section) {
  const sectionIndex = [...document.querySelectorAll('.section-card')].indexOf(section);
  const lessonIndex = section.querySelectorAll('.lesson-item').length;
  
  const lessonItem = document.createElement('div');
  lessonItem.className = 'lesson-item';
  lessonItem.innerHTML = `
    <div class="lesson-box">
      <input type="text" class="form-input" name="sections[${sectionIndex}][lessons][${lessonIndex}][title]" placeholder="Lesson title" required/>
      
      <div class="video-source-toggle">
        <label class="radio-label">
          <input type="radio" name="sections[${sectionIndex}][lessons][${lessonIndex}][videoSource]" value="url" checked>
          <span>Video URL</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="sections[${sectionIndex}][lessons][${lessonIndex}][videoSource]" value="file">
          <span>Upload Video</span>
        </label>
      </div>
      
      <input type="url" class="form-input video-url-input" name="sections[${sectionIndex}][lessons][${lessonIndex}][videoUrl]" placeholder="Paste YouTube/Vimeo URL"/>
      
      <div class="file-upload-box video-file-box" style="display:none;">
        <input type="file" class="video-file-input" name="sections[${sectionIndex}][lessons][${lessonIndex}][videoFile]" accept="video/*">
        <div class="file-display">
          <i class="fa-solid fa-video"></i>
          <span class="file-name">Choose Video File</span>
          <button type="button" class="btn-clear-file" style="display:none;"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      
      <div class="file-upload-box doc-file-box">
        <input type="file" class="doc-file-input" name="sections[${sectionIndex}][lessons][${lessonIndex}][resourceFile]" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt">
        <div class="file-display">
          <i class="fa-solid fa-file-pdf"></i>
          <span class="file-name">Add Document (Optional)</span>
          <button type="button" class="btn-clear-file" style="display:none;"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      
      <button type="button" class="btn-remove-lesson"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `;
  
  const lessonBox = lessonItem.querySelector('.lesson-box');
  setupFileUpload(lessonBox);
  
  lessonBox.querySelector('.btn-remove-lesson').addEventListener('click', () => {
    if (section.querySelectorAll('.lesson-item').length > 1) {
      lessonItem.remove();
      reindexSection(section);
    } else {
      alert('A section must have at least one lesson');
    }
  });
  
  section.querySelector('.section-lessons').appendChild(lessonItem);
  lessonItem.querySelector('.form-input').focus();
}

// ══════════════════════════════════════════════════════════════
// ADD SECTION
// ══════════════════════════════════════════════════════════════

document.getElementById('add-section').addEventListener('click', () => {
  const sectionIndex = document.querySelectorAll('.section-card').length;
  
  const section = document.createElement('div');
  section.className = 'section-card';
  section.innerHTML = `
    <div class="section-title-row">
      <input type="text" class="form-input section-title-input" name="sections[${sectionIndex}][title]" placeholder="Section title" required/>
      <button type="button" class="btn-delete-section" title="Delete Section">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <div class="section-lessons">
      <div class="lesson-item">
        <div class="lesson-box">
          <input type="text" class="form-input" name="sections[${sectionIndex}][lessons][0][title]" placeholder="Lesson title" required/>
          
          <div class="video-source-toggle">
            <label class="radio-label">
              <input type="radio" name="sections[${sectionIndex}][lessons][0][videoSource]" value="url" checked>
              <span>Video URL</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="sections[${sectionIndex}][lessons][0][videoSource]" value="file">
              <span>Upload Video</span>
            </label>
          </div>
          
          <input type="url" class="form-input video-url-input" name="sections[${sectionIndex}][lessons][0][videoUrl]" placeholder="Paste YouTube/Vimeo URL"/>
          
          <div class="file-upload-box video-file-box" style="display:none;">
            <input type="file" class="video-file-input" name="sections[${sectionIndex}][lessons][0][videoFile]" accept="video/*">
            <div class="file-display">
              <i class="fa-solid fa-video"></i>
              <span class="file-name">Choose Video File</span>
              <button type="button" class="btn-clear-file" style="display:none;"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          
          <div class="file-upload-box doc-file-box">
            <input type="file" class="doc-file-input" name="sections[${sectionIndex}][lessons][0][resourceFile]" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt">
            <div class="file-display">
              <i class="fa-solid fa-file-pdf"></i>
              <span class="file-name">Add Document (Optional)</span>
              <button type="button" class="btn-clear-file" style="display:none;"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          
          <button type="button" class="btn-remove-lesson"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
    </div>

    <button type="button" class="btn-add-lesson">
      <i class="fa-solid fa-plus"></i> Add Lesson
    </button>
  `;
  
  const firstLesson = section.querySelector('.lesson-box');
  setupFileUpload(firstLesson);
  
  section.querySelector('.btn-add-lesson').addEventListener('click', () => addLesson(section));
  
  section.querySelector('.btn-remove-lesson').addEventListener('click', function() {
    if (section.querySelectorAll('.lesson-item').length > 1) {
      this.closest('.lesson-item').remove();
      reindexSection(section);
    } else {
      alert('A section must have at least one lesson');
    }
  });
  
  section.querySelector('.btn-delete-section').addEventListener('click', () => {
    if (confirm('Delete this section?')) {
      section.remove();
      reindexAllSections();
    }
  });
  
  document.getElementById('sections-list').appendChild(section);
  section.querySelector('.form-input').focus();
});

// ══════════════════════════════════════════════════════════════
// REINDEX
// ══════════════════════════════════════════════════════════════

function reindexSection(section) {
  const sectionIndex = [...document.querySelectorAll('.section-card')].indexOf(section);
  
  section.querySelectorAll('.lesson-item').forEach((lesson, lessonIdx) => {
    const box = lesson.querySelector('.lesson-box');
    box.querySelectorAll('[name]').forEach(input => {
      const name = input.getAttribute('name');
      input.name = name.replace(/sections\[\d+\]\[lessons\]\[\d+\]/, `sections[${sectionIndex}][lessons][${lessonIdx}]`);
    });
  });
}

function reindexAllSections() {
  document.querySelectorAll('.section-card').forEach((section, sectionIdx) => {
    section.querySelector('.section-title-input').name = `sections[${sectionIdx}][title]`;
    reindexSection(section);
  });
}

// ══════════════════════════════════════════════════════════════
// INITIALIZE
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Setup first lesson file uploads
  const firstLesson = document.querySelector('.lesson-box');
  if (firstLesson) {
    setupFileUpload(firstLesson);
  }
  
  // First section buttons
  const firstSection = document.querySelector('.section-card');
  if (firstSection) {
    firstSection.querySelector('.btn-add-lesson')?.addEventListener('click', () => addLesson(firstSection));
    
    firstSection.querySelector('.btn-remove-lesson')?.addEventListener('click', function() {
      if (firstSection.querySelectorAll('.lesson-item').length > 1) {
        this.closest('.lesson-item').remove();
        reindexSection(firstSection);
      } else {
        alert('A section must have at least one lesson');
      }
    });
    
    firstSection.querySelector('.btn-delete-section')?.addEventListener('click', () => {
      if (document.querySelectorAll('.section-card').length > 1) {
        if (confirm('Delete this section?')) {
          firstSection.remove();
          reindexAllSections();
        }
      } else {
        alert('You must have at least one section');
      }
    });
  }
});

// ══════════════════════════════════════════════════════════════
// FORM VALIDATION
// ══════════════════════════════════════════════════════════════

document.getElementById('courseForm').addEventListener('submit', (e) => {
  let valid = true;
  
  // Check outcomes
  const outcomes = document.querySelectorAll('.outcome-item .form-input');
  let hasOutcome = false;
  outcomes.forEach(input => {
    if (input.value.trim()) hasOutcome = true;
  });
  
  if (!hasOutcome) {
    alert('Add at least one learning outcome');
    e.preventDefault();
    return;
  }
  
  // Check sections
  document.querySelectorAll('.section-card').forEach((section, idx) => {
    const title = section.querySelector('.section-title-input');
    if (!title.value.trim()) {
      alert(`Section ${idx + 1} needs a title`);
      title.focus();
      valid = false;
    }
    
    const lessons = section.querySelectorAll('.lesson-item .form-input:first-child');
    let hasLesson = false;
    lessons.forEach(lesson => {
      if (lesson.value.trim()) hasLesson = true;
    });
    
    if (!hasLesson) {
      alert(`Section ${idx + 1} needs at least one lesson with a title`);
      valid = false;
    }
  });
  
  if (!valid) e.preventDefault();
});
