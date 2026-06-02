// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById('err-' + fieldId);
  if (input)  { input.classList.add('invalid'); input.classList.remove('valid'); }
  if (error)  { error.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + message; error.classList.add('visible'); }
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById('err-' + fieldId);
  if (input)  { input.classList.remove('invalid'); input.classList.add('valid'); }
  if (error)  { error.textContent = ''; error.classList.remove('visible'); }
}

function clearAll() {
  ['cardName','cardNumber','expiry','cvv','terms'].forEach(id => {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);
    if (input) { input.classList.remove('invalid','valid'); }
    if (error) { error.textContent = ''; error.classList.remove('visible'); }
  });
}

// ─────────────────────────────────────────────
//  Individual validators  (return true = valid)
// ─────────────────────────────────────────────
function validateName() {
  const val = document.getElementById('cardName').value.trim();
  if (!val) {
    showError('cardName', 'Cardholder name is required.'); return false;
  }
  if (val.length < 3) {
    showError('cardName', 'Name must be at least 3 characters.'); return false;
  }
  if (!/^[a-zA-Z\s\'-]+$/.test(val)) {
    showError('cardName', 'Name can only contain letters, spaces, hyphens, or apostrophes.'); return false;
  }
  clearError('cardName'); return true;
}

function validateCardNumber() {
  const raw = document.getElementById('cardNumber').value.replace(/\s/g, '');
  if (!raw) {
    showError('cardNumber', 'Card number is required.'); return false;
  }
  if (!/^\d+$/.test(raw)) {
    showError('cardNumber', 'Card number must contain digits only.'); return false;
  }
  if (raw.length !== 16) {
    showError('cardNumber', 'Card number must be exactly 16 digits.'); return false;
  }

  clearError('cardNumber'); return true;
}

function validateExpiry() {
  const val = document.getElementById('expiry').value.trim();
  if (!val) {
    showError('expiry', 'Expiry date is required.'); return false;
  }
  if (!/^\d{2}\/\d{2}$/.test(val)) {
    showError('expiry', 'Use MM/YY format.'); return false;
  }
  const [mm, yy] = val.split('/').map(Number);
  if (mm < 1 || mm > 12) {
    showError('expiry', 'Month must be between 01 and 12.'); return false;
  }
  const now       = new Date();
  const cardYear  = 2000 + yy;
  const cardMonth = mm;
  if (cardYear < now.getFullYear() || (cardYear === now.getFullYear() && cardMonth < now.getMonth() + 1)) {
    showError('expiry', 'Card has expired.'); return false;
  }
  clearError('expiry'); return true;
}

function validateCVV() {
  const val = document.getElementById('cvv').value.trim();
  if (!val) {
    showError('cvv', 'CVV is required.'); return false;
  }
  if (!/^\d{3}$/.test(val)) {
    showError('cvv', 'CVV must be exactly 3 digits.'); return false;
  }
  clearError('cvv'); return true;
}

function validateTerms() {
  const checked = document.getElementById('terms').checked;
  const error   = document.getElementById('err-terms');
  if (!checked) {
    if (error) { error.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> You must agree to the terms to continue.'; error.classList.add('visible'); }
    return false;
  }
  if (error) { error.textContent = ''; error.classList.remove('visible'); }
  return true;
}

// ─────────────────────────────────────────────
//  Live validation on blur
// ─────────────────────────────────────────────
document.getElementById('cardName').addEventListener('blur', validateName);
document.getElementById('cardNumber').addEventListener('blur', validateCardNumber);
document.getElementById('expiry').addEventListener('blur', validateExpiry);
document.getElementById('cvv').addEventListener('blur', validateCVV);
document.getElementById('terms').addEventListener('change', validateTerms);

// Clear error as user starts retyping
['cardName','cardNumber','expiry','cvv'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);
    if (input.classList.contains('invalid')) {
      input.classList.remove('invalid','valid');
      if (error) { error.textContent = ''; error.classList.remove('visible'); }
    }
  });
});
function detectCardType(cardNumber) {
  const number = cardNumber.replace(/\s/g, "");

  if (/^4\d{0,15}$/.test(number)) {
    return "visa";
  }

  const firstTwo = Number(number.slice(0, 2));
  const firstFour = Number(number.slice(0, 4));

  if (
    (firstTwo >= 51 && firstTwo <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "mastercard";
  }

  return "unknown";
}

function updateCardBrandUI(cardType) {
  const visa = document.getElementById("brandVisa");
  const mastercard = document.getElementById("brandMastercard");
  const hiddenInput = document.getElementById("cardType");

  if (hiddenInput) {
    hiddenInput.value = cardType;
  }

  if (visa) {
    visa.classList.toggle("active", cardType === "visa");
  }

  if (mastercard) {
    mastercard.classList.toggle("active", cardType === "mastercard");
  }
}
// ─────────────────────────────────────────────
//  Input formatting
// ─────────────────────────────────────────────
document.getElementById('cardNumber').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '').substring(0, 16);
  this.value = val.replace(/(.{4})/g, '$1 ').trim();

  const cardType = detectCardType(this.value);
  updateCardBrandUI(cardType);
});

document.getElementById('expiry').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
  this.value = val;
});

document.getElementById('cvv').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '').substring(0, 3);
});

// ─────────────────────────────────────────────
//  Promo code
// ─────────────────────────────────────────────
const PROMO_CODES = { 'SAVE10': 0.10, 'EDU20': 0.20 };

function updateOrderSummary(subtotal) {
  const subEl   = document.getElementById('subtotal');
  const taxEl   = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const taxRate = Number(taxEl?.dataset.taxRate || 0);
  const tax     = subtotal * taxRate;
  const total   = subtotal + tax;

  if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);
  if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

document.getElementById('promo').addEventListener('blur', function () {
  const code    = this.value.trim().toUpperCase();
  const errEl   = document.getElementById('err-promo');
  const subEl   = document.getElementById('subtotal');
  const originalSubtotal = Number(subEl?.dataset.subtotal || 0);

  if (!code) {
    updateOrderSummary(originalSubtotal);
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
    return;
  }

  if (PROMO_CODES[code]) {
    const discounted = originalSubtotal * (1 - PROMO_CODES[code]);
    updateOrderSummary(discounted);
    if (errEl) {
      errEl.style.color = 'var(--teal)';
      errEl.innerHTML   = '<i class="fa-solid fa-circle-check"></i> Promo code applied!';
      errEl.classList.add('visible');
    }
  } else {
    updateOrderSummary(originalSubtotal);
    if (errEl) {
      errEl.style.color = 'var(--pink)';
      errEl.innerHTML   = '<i class="fa-solid fa-circle-exclamation"></i> Invalid promo code.';
      errEl.classList.add('visible');
    }
  }
});

// ─────────────────────────────────────────────
//  Submit
// ─────────────────────────────────────────────
const paymentForm = document.getElementById('paymentForm');

paymentForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const isValid = [
    validateName(),
    validateCardNumber(),
    validateExpiry(),
    validateCVV(),
    validateTerms()
  ].every(Boolean);

  if (!isValid) {
    return;
  }

  const btn = document.getElementById('confirmBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

  paymentForm.submit();
});