const titleInput        = document.getElementById('challengeTitle');
const difficultySelect  = document.getElementById('difficulty');
const categorySelect    = document.getElementById('category');
const descriptionArea   = document.getElementById('description');
const starterCodeArea   = document.getElementById('starterCode');
const testCasesArea     = document.getElementById('testCases');
const previewBody       = document.getElementById('previewBody');
const saveBtn           = document.getElementById('saveBtn');
const cancelBtn         = document.getElementById('cancelBtn');
const generateBtn       = document.getElementById('generateBtn');

const starterPlaceholder = `function solve() {\n  // Your code here\n}`;
let generatedPoints = null;
if (!starterCodeArea.value.trim()) {
  starterCodeArea.value = starterPlaceholder;
  starterCodeArea.classList.add('placeholder-active');
}

starterCodeArea.addEventListener('focus', () => {
    if (starterCodeArea.value === starterPlaceholder) {
        starterCodeArea.value = '';
        starterCodeArea.classList.remove('placeholder-active');
    }
});

starterCodeArea.addEventListener('blur', () => {
    if (starterCodeArea.value.trim() === '') {
        starterCodeArea.value = starterPlaceholder;
        starterCodeArea.classList.add('placeholder-active');
    }
});

const testPlaceholder = `Input: [1, 2, 3]\nExpected: 6`;

if (!testCasesArea.value.trim()) {
  testCasesArea.value = testPlaceholder;
  testCasesArea.classList.add('placeholder-active');
}

testCasesArea.addEventListener('focus', () => {
    if (testCasesArea.value === testPlaceholder) {
        testCasesArea.value = '';
        testCasesArea.classList.remove('placeholder-active');
    }
});

testCasesArea.addEventListener('blur', () => {
    if (testCasesArea.value.trim() === '') {
        testCasesArea.value = testPlaceholder;
        testCasesArea.classList.add('placeholder-active');
    }
});

function updatePreview() {
    const title       = titleInput.value.trim();
    const difficulty  = difficultySelect.value;
    const category    = categorySelect.value;
    const description = descriptionArea.value.trim();
    const starterCode = starterCodeArea.classList.contains('placeholder-active')
        ? ''
        : starterCodeArea.value.trim();
    const testCases   = testCasesArea.classList.contains('placeholder-active')
        ? ''
        : testCasesArea.value.trim();

    if (!title && !difficulty && !description) {
        previewBody.innerHTML = `
            <div class="preview-empty">
                <i class="fa-solid fa-code preview-empty-icon"></i>
                <p>Fill in the form to see preview</p>
            </div>`;
        return;
    }

    let html = '<div class="preview-content">';

    
    if (title) {
        html += `<p class="preview-challenge-title">${escapeHtml(title)}</p>`;
    }

    if (difficulty || category) {
        html += '<div class="preview-badges">';
        if (difficulty) {
            html += `<span class="preview-badge badge-${difficulty}">${capitalize(difficulty)}</span>`;
        }
        if (category) {
            html += `<span class="preview-badge badge-category">${getCategoryLabel(category)}</span>`;
        }
        html += '</div>';
    }

    if (description) {
        html += `<p class="preview-description">${escapeHtml(description)}</p>`;
    }

    if (starterCode) {
        html += `
            <div class="preview-code-block">
                <div class="preview-code-header starter">
                    <i class="fa-solid fa-code"></i> Starter Code
                </div>
                <pre class="preview-code-content">${escapeHtml(starterCode)}</pre>
            </div>`;
    }

    if (testCases) {
        html += `
            <div class="preview-code-block">
                <div class="preview-code-header tests">
                    <i class="fa-solid fa-flask"></i> Test Cases
                </div>
                <pre class="preview-code-content">${escapeHtml(testCases)}</pre>
            </div>`;
    }

    html += '</div>';
    previewBody.innerHTML = html;
}

[titleInput, descriptionArea, starterCodeArea, testCasesArea].forEach(el => {
    el.addEventListener('input', updatePreview);
});
[difficultySelect, categorySelect].forEach(el => {
    el.addEventListener('change', updatePreview);
});

function getPointsFromDifficulty(difficulty) {
  const map = {
    easy: 50,
    medium: 100,
    hard: 150
  };
  return map[difficulty.toLowerCase()] || 100;
}

function parseTestCases(text) {
  const blocks = text.trim().split(/\n\s*\n/);
  const cases = [];

  blocks.forEach(block => {
    const lines = block.split('\n');
    let input = '';
    let expectedOutput = '';

    lines.forEach(line => {
      if (/^Input:\s*/i.test(line)) {
        input = line.replace(/^Input:\s*/i, '').trim();
      }
      if (/^Expected:\s*/i.test(line)) {
        expectedOutput = line.replace(/^Expected:\s*/i, '').trim();
      }
    });

    if (input && expectedOutput) {
      cases.push({
        input,
        expectedOutput,
        isHidden: false
      });
    }
  });

  return cases;
}

function validateForm() {
    let valid = true;

    const required = [
        { el: titleInput,       msg: 'Challenge title is required' },
        { el: difficultySelect, msg: 'Please select a difficulty' },
        { el: categorySelect,   msg: 'Please select a category' },
        { el: descriptionArea,  msg: 'Description is required' },
        { el: testCasesArea,    msg: 'Test cases are required' },
    ];

    document.querySelectorAll('.error-msg').forEach(e => e.remove());
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));

    required.forEach(({ el, msg }) => {
        const isPlaceholder = el.classList.contains('placeholder-active');
        if (!el.value.trim() || isPlaceholder) {
            el.classList.add('error');
            const errEl = document.createElement('span');
            errEl.className = 'error-msg';
            errEl.textContent = msg;
            el.closest('.form-group').appendChild(errEl);
            valid = false;
        }
    });

    return valid;
}


saveBtn.addEventListener('click', async () => {
  if (!validateForm()) return;

  const testCasesText = testCasesArea.classList.contains('placeholder-active')
    ? ''
    : testCasesArea.value.trim();

  const parsedTestCases = parseTestCases(testCasesText);

  if (parsedTestCases.length === 0) {
    alert('Test cases must use this format:\nInput: ...\nExpected: ...');
    return;
  }

  const payload = {
  title: titleInput.value.trim(),
  difficulty: difficultySelect.value.toLowerCase(),
  category: categorySelect.value,
  description: descriptionArea.value.trim(),
  points: generatedPoints || getPointsFromDifficulty(difficultySelect.value),
  starterCode: starterCodeArea.classList.contains('placeholder-active')
    ? ''
    : starterCodeArea.value.trim(),
  testCases: parsedTestCases,
  isPublished: true
};
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {
      const isEditMode = window.challengeMode === 'edit';
      const saveUrl = isEditMode
        ? `/admin/challenges/${window.challengeId}/edit`
        : '/admin/create-challenge';

      const res = await fetch(saveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Save failed');
    }

    showToast(isEditMode ? 'Challenge updated successfully!' : 'Challenge saved successfully!');

    setTimeout(() => {
      window.location.href = '/admin/manage-challenges';
    }, 1000);

  } catch (err) {
    alert(err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = isEditMode
  ? '<i class="fa-solid fa-floppy-disk"></i> Update Challenge'
  : '<i class="fa-solid fa-floppy-disk"></i> Save Challenge';
  }
});

cancelBtn.addEventListener('click', () => {
    history.back();
});
if (generateBtn) {
generateBtn.addEventListener('click', async () => {
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

  try {
    const res = await fetch('/admin/generate-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: document.getElementById('aiTopic')?.value || '',
        difficulty: document.getElementById('aiDifficulty')?.value || 'medium',
        category: document.getElementById('aiCategory')?.value || 'Arrays'
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Generation failed');
    }

    const c = data.challenge;
    generatedPoints = c.points || null;

    titleInput.value = c.title || '';
    descriptionArea.value = c.description || '';

    // Map lowercase DB difficulty to your select values
    const diffMap = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    difficultySelect.value = diffMap[c.difficulty] || 'Medium';
    categorySelect.value = c.category || 'Arrays';

    starterCodeArea.value = c.starterCode || '';
    starterCodeArea.classList.remove('placeholder-active');

    // Convert structured test cases to your textarea format
    if (Array.isArray(c.testCases)) {
  testCasesArea.value = c.testCases
    .slice(0, 1)
    .map(tc => `Input: ${tc.input}\nExpected: ${tc.expectedOutput}`)
    .join('\n\n');

  testCasesArea.classList.remove('placeholder-active');
}

    updatePreview();
    showToast('Challenge generated! Review and edit before saving.');

  } catch (err) {
    alert(err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate';
  }
});}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCategoryLabel(value) {
    const map = {
        arrays:  'Arrays',
        strings: 'Strings',
        trees:   'Trees',
        graphs:  'Graphs',
        dp:      'Dynamic Programming',
        sorting: 'Sorting'
    };
    return map[value] || value;
}
updatePreview();