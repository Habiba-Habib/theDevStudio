const testCases = [
  {
    title: "Test Case 1",
    status: "Passed",
    time: "12ms",
    input: "nums = [2,7,11,15], target = 9",
    expected: "[0,1]",
    output: "[0,1]"
  },
  {
    title: "Test Case 2",
    status: "Passed",
    time: "8ms",
    input: "nums = [3,2,4], target = 6",
    expected: "[1,2]",
    output: "[1,2]"
  },
  {
    title: "Test Case 3",
    status: "Passed",
    time: "10ms",
    input: "nums = [3,3], target = 6",
    expected: "[0,1]",
    output: "[0,1]"
  },
  {
    title: "Test Case 4",
    status: "Passed",
    time: "15ms",
    input: "nums = [1,5,3,7,9], target = 12",
    expected: "[2,4]",
    output: "[2,4]"
  },
  {
    title: "Test Case 5",
    status: "Passed",
    time: "11ms",
    input: "nums = [2,5,5,11], target = 10",
    expected: "[1,2]",
    output: "[1,2]"
  }
];

const testList = document.getElementById("testList");

function createTestCaseCard(test) {
  const card = document.createElement("div");
  card.className = "test-card";

function formatPromoCode(value) {
  return value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 12);
}

if (cardholderName) {
  cardholderName.addEventListener("input", function (event) {
    event.target.value = formatCardholderName(event.target.value);
  });
}

if (cardNumber) {
  cardNumber.addEventListener("input", function (event) {
    event.target.value = formatCardNumber(event.target.value);
  });
}

if (expiryDate) {
  expiryDate.addEventListener("input", function (event) {
    event.target.value = formatExpiryDate(event.target.value);
  });
}

if (cvv) {
  cvv.addEventListener("input", function (event) {
    event.target.value = formatCVV(event.target.value);
  });
}

if (promoCode) {
  promoCode.addEventListener("input", function (event) {
    event.target.value = formatPromoCode(event.target.value);
  });
}

if (paymentForm) {
  paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nameValue = cardholderName.value.trim();
    const cardValue = cardNumber.value.trim();
    const expiryValue = expiryDate.value.trim();
    const cvvValue = cvv.value.trim();

    if (!nameValue || !cardValue || !expiryValue || !cvvValue) {
      alert("Please fill in all required payment fields.");
      return;
    }

    if (cardValue.replace(/\s/g, "").length !== 16) {
      alert("Card number must be 16 digits.");
      return;
    }

    if (expiryValue.length !== 5 || !expiryValue.includes("/")) {
      alert("Expiry date must be in MM/YY format.");
      return;
    }

    if (cvvValue.length !== 3) {
      alert("CVV must be 3 digits.");
      return;
    }

    if (!agreeTerms.checked) {
      alert("Please agree to the terms and conditions.");
      return;
    }

   document.body.innerHTML = `
  <div class="success-screen">
    <div class="success-circle" style="background:#ff6b6b; box-shadow:0 0 0 8px rgba(255, 107, 107, 0.15);">
      <div class="success-check">✕</div>
    </div>
    <h1>Payment Failed</h1>
    <p class="success-text">Something went wrong. Please check your payment details and try again.</p>
    <p class="redirect-text">Redirecting back...</p>
  </div>
`;

    setTimeout(function () {
      window.location.href = "payment.html";
    }, 2000);
  card.innerHTML = `
    <div class="test-top">
      <div class="test-title-wrap">
        <div class="test-circle">✓</div>
        <div class="test-title">${test.title}</div>
      </div>

      <div class="test-status-wrap">
        <span class="test-status">${test.status}</span>
        <span class="test-time">${test.time}</span>
      </div>
    </div>

    <div class="test-fields">
      <div class="test-field">
        <label>Input:</label>
        <div class="code-line">${test.input}</div>
      </div>

      <div class="output-grid">
        <div class="test-field">
          <label>Expected:</label>
          <div class="code-box">${test.expected}</div>
        </div>

        <div class="test-field">
          <label>Your Output:</label>
          <div class="code-box">${test.output}</div>
        </div>
      </div>
    </div>
  `;

  return card;
}

testCases.forEach((test) => {
  testList.appendChild(createTestCaseCard(test));
}); 
const retryBtn = document.querySelector(".btn-outline");
const nextBtn = document.querySelector(".btn-pink");

if (retryBtn) {
  retryBtn.addEventListener("click", () => {
    window.location.href = "start-challenge.html";
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    window.location.href = "leaderboard.html";
  });
}