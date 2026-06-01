// ── LIVE PRICE PREVIEW ──
document.getElementById('price-input').addEventListener('input', function () {
  const val = parseFloat(this.value);
  document.getElementById('preview-price').textContent = isNaN(val) ? '$0' : '$' + val.toFixed(2);
});

// ── FORM VALIDATION — runs before submit ──
document.querySelector('form').addEventListener('submit', (e) => {
  const priceInput = document.getElementById('price-input');
  const durationInput = document.querySelector('input[name="duration"]');
  let valid = true;

  if (!priceInput.value.trim() || parseFloat(priceInput.value) < 0) {
    priceInput.style.borderColor = 'var(--pink)';
    priceInput.style.boxShadow = '0 0 0 3px rgba(255,64,160,0.2)';
    valid = false;
  }

  if (!durationInput.value.trim()) {
    durationInput.style.borderColor = 'var(--pink)';
    durationInput.style.boxShadow = '0 0 0 3px rgba(255,64,160,0.2)';
    valid = false;
  }

  if (!valid) {
    e.preventDefault();
    const btn = document.querySelector('.btn-publish');
    btn.style.transform = 'translateX(-6px)';
    setTimeout(() => btn.style.transform = 'translateX(6px)', 100);
    setTimeout(() => btn.style.transform = 'translateX(0)', 200);
  }
});

// ── CLEAR ERRORS ON TYPING ──
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('input', () => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
});
