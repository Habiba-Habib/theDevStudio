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

starterCodeArea.value = starterPlaceholder;
starterCodeArea.classList.add('placeholder-active');

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

testCasesArea.value = testPlaceholder;
testCasesArea.classList.add('placeholder-active');

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


saveBtn.addEventListener('click', () => {
    if (!validateForm()) return;

    const challenge = {
        title:       titleInput.value.trim(),
        difficulty:  difficultySelect.value,
        category:    categorySelect.value,
        description: descriptionArea.value.trim(),
        starterCode: starterCodeArea.classList.contains('placeholder-active')
            ? ''
            : starterCodeArea.value.trim(),
        testCases:   testCasesArea.classList.contains('placeholder-active')
            ? ''
            : testCasesArea.value.trim(),
        createdAt:   new Date().toISOString()
    };

    console.log('Saving challenge:', challenge);

    showToast('Challenge saved successfully!');

    setTimeout(() => {
        window.location.href = '/public/pages/admin/manage-challenges.html';
    }, 1000);
});

cancelBtn.addEventListener('click', () => {
    history.back();
});


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