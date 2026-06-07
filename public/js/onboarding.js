const STEPS = ['step-1', 'step-2', 'step-3', 'step-4'];
const DOTS  = ['dot-1',  'dot-2',  'dot-3',  'dot-4'];
let current = 0;

function showStep(index) {
  STEPS.forEach((id, i) => document.getElementById(id).classList.toggle('active', i === index));
  DOTS.forEach((id, i)  => document.getElementById(id).classList.toggle('active', i === index));
  current = index;
}

// ── SHARED SUBMIT ─────────────────────────────────────────────
// Called by both instructors (from avatar step / step-3) and students (from experience step / step-4)
// Shows errors in the element that belongs to the CURRENTLY VISIBLE step.
async function submitOnboarding() {
  const avatar = document.getElementById('selected-avatar').value;
  const role   = document.getElementById('selected-role').value;
  const level  = document.getElementById('selected-level')?.value || '';

  // Pick the error element for whichever step is visible right now
  // current === 2  → step-3 (avatar / instructor submit)
  // current === 3  → step-4 (experience level / student submit)
  const errorEl = current === 2
    ? document.getElementById('step3-error')
    : document.getElementById('level-error');

  const clearError = () => { if (errorEl) errorEl.textContent = ''; };
  const showError  = (msg) => { if (errorEl) errorEl.textContent = msg; };

  // Students must pick an experience level; instructors skip that step
  if (role === 'student' && !level) {
    showError('Please choose your experience level to continue.');
    return;
  }
  clearError();

  document.getElementById('loading-overlay').classList.remove('hidden');

  try {
    const res  = await fetch('/auth/onboarding', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        avatar,
        experienceLevel: level || null,
        intendedRole:    role
      })
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok) {
      document.getElementById('loading-overlay').classList.add('hidden');
      if (res.status === 401 && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      showError(data.message || 'Something went wrong. Please try again.');
      return;
    }

    window.location.href = data.redirectUrl;
  } catch {
    document.getElementById('loading-overlay').classList.add('hidden');
    showError('Connection error. Please try again.');
  }
}

// ── STEP NAVIGATION ──────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => showStep(1));

// Step 2: Role ← → Step 3: Avatar
document.getElementById('btn-back-2').addEventListener('click', () => showStep(0));
document.getElementById('btn-next-2').addEventListener('click', () => {
  const role      = document.getElementById('selected-role').value;
  const roleError = document.getElementById('role-error');
  if (!role) {
    roleError.textContent = 'Please choose your role to continue.';
    return;
  }
  roleError.textContent = '';
  showStep(2);
});

// Step 3: Avatar ← back | next → depends on role
// Instructors: submit directly (no experience level needed)
// Students: go to step 4 (experience level)
document.getElementById('btn-back-3').addEventListener('click', () => showStep(1));
document.getElementById('btn-next-3').addEventListener('click', async () => {
  const role = document.getElementById('selected-role').value;
  if (role === 'instructor') {
    await submitOnboarding();   // skip experience level step entirely
  } else {
    showStep(3);                // student → go to experience level step
  }
});

// Step 4: Experience ← → submit (students only)
document.getElementById('btn-back-4').addEventListener('click', () => showStep(2));
document.getElementById('btn-finish').addEventListener('click', async () => {
  await submitOnboarding();
});

// ── ROLE SELECTION ───────────────────────────────────────────
document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const selectedRole = card.dataset.role;
    document.getElementById('selected-role').value = selectedRole;
    document.getElementById('role-error').textContent = '';

    // Update the avatar step's forward button to reflect the role
    const nextBtn = document.getElementById('btn-next-3');
    if (selectedRole === 'instructor') {
      nextBtn.innerHTML = 'Finish Setup <i class="fa-solid fa-rocket"></i>';
    } else {
      nextBtn.innerHTML = 'Continue <i class="fa-solid fa-arrow-right"></i>';
    }
  });
});

// ── AVATAR SELECTION ─────────────────────────────────────────
document.querySelectorAll('.avatar-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.avatar-item').forEach(a => a.classList.remove('selected'));
    item.classList.add('selected');
    const av = item.dataset.avatar;
    document.getElementById('selected-avatar').value = av;
    document.getElementById('avatar-preview').src = `/images/avatars/${av}`;
    document.getElementById('avatar-preview-label').textContent = av;
  });
});

// ── EXPERIENCE LEVEL SELECTION (students only) ───────────────
document.querySelectorAll('.level-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('selected-level').value = card.dataset.level;
    document.getElementById('level-error').textContent = '';
  });
});
