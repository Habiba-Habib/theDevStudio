    // ── UPLOAD AREA ──
    const uploadArea = document.getElementById('upload-area');
    const fileInput  = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      uploadArea.querySelector('.upload-text').textContent = file.name;
      uploadArea.querySelector('.upload-hint').textContent = 'Click to change file';
      uploadArea.querySelector('.upload-icon i').className = 'fa-solid fa-check';
      uploadArea.style.borderColor = 'var(--teal)';
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--pink)';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'rgba(255,255,255,0.15)';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event('change'));
    });

    // ── ADD TASK ──
    let taskCount = 1;

    document.getElementById('add-task-btn').addEventListener('click', () => {
      taskCount++;
      const list = document.getElementById('task-list');
      const item = document.createElement('div');
      item.className = 'task-item';
      item.innerHTML = `
        <input type="text" class="form-input" placeholder="Task ${taskCount}: e.g., Add a description"/>
        <button class="btn-remove-task"><i class="fa-solid fa-xmark"></i></button>
      `;
      item.querySelector('.btn-remove-task').addEventListener('click', () => {
        item.remove();
        taskCount--;
      });
      list.appendChild(item);
      item.querySelector('.form-input').focus();
    });

    // ── PUBLISH ──
    document.getElementById('publish-btn').addEventListener('click', () => {
      const lessonTitle = document.getElementById('lesson-title');
      let valid = true;

      if (!lessonTitle.value.trim()) {
        lessonTitle.style.borderColor = 'var(--pink)';
        lessonTitle.style.boxShadow = '0 0 0 3px rgba(255,64,160,0.2)';
        valid = false;
      } else {
        lessonTitle.style.borderColor = 'var(--border)';
        lessonTitle.style.boxShadow = 'none';
      }

      if (!valid) {
        const btn = document.getElementById('publish-btn');
        btn.style.transform = 'translateX(-6px)';
        setTimeout(() => btn.style.transform = 'translateX(6px)', 100);
        setTimeout(() => btn.style.transform = 'translateX(0)', 200);
        return;
      }

  
      const btn = document.getElementById('publish-btn');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Published!';
      btn.style.background = 'linear-gradient(90deg, var(--teal), var(--yellow))';
      btn.disabled = true;

      setTimeout(() => history.back(), 1500);
    });

    // clear errors on typing
    document.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = 'var(--border)';
        input.style.boxShadow = 'none';
      });
    });