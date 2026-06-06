const STEPS = ['step-1', 'step-2', 'step-3'];
const DOTS  = ['dot-1',  'dot-2',  'dot-3'];
let current = 0;

function showStep(index) {
  STEPS.forEach((id, i) => document.getElementById(id).classList.toggle('active', i === index));
  DOTS.forEach((id, i) => document.getElementById(id).classList.toggle('active', i === index));
  current = index;
}

// Step nav
document.getElementById('btn-start').addEventListener('click',  () => showStep(1));
document.getElementById('btn-back-2').addEventListener('click', () => showStep(0));
document.getElementById('btn-next-2').addEventListener('click', () => showStep(2));
document.getElementById('btn-back-3').addEventListener('click', () => showStep(1));

// Avatar selection
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

// Experience level selection
document.querySelectorAll('.level-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('selected-level').value = card.dataset.level;
    document.getElementById('level-error').textContent = '';
  });
});

// Submit
document.getElementById('btn-finish').addEventListener('click', async () => {
  const levelError = document.getElementById('level-error');
  const ageError   = document.getElementById('age-error');
  const level      = document.getElementById('selected-level').value;
  const avatar     = document.getElementById('selected-avatar').value;
  const ageInput   = document.getElementById('age-input');
  const age        = parseInt(ageInput.value, 10);

  levelError.textContent = '';
  ageError.textContent   = '';
  ageInput.classList.remove('error');

  let valid = true;

  if (!level) {
    levelError.textContent = 'Please choose your experience level to continue.';
    valid = false;
  }

  if (!ageInput.value || isNaN(age) || age < 5 || age > 120) {
    ageError.textContent = 'Please enter a valid age between 5 and 120.';
    ageInput.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  document.getElementById('loading-overlay').classList.remove('hidden');

  try {
    const res  = await fetch('/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar, experienceLevel: level, age })
    });
    const data = await res.json();

    if (!res.ok) {
      document.getElementById('loading-overlay').classList.add('hidden');
      levelError.textContent = data.message || 'Something went wrong. Please try again.';
      return;
    }

    window.location.href = data.redirectUrl;
  } catch {
    document.getElementById('loading-overlay').classList.add('hidden');
    levelError.textContent = 'Connection error. Please try again.';
  }
});
