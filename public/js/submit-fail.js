const testCases = [
  {
    title: "Test Case 1",
    status: "Passed",
    time: "8ms",
    input: "nums = [2,7,11,15], target = 9",
    expected: "[0,1]",
    output: "[0,1]"
  },
  {
    title: "Test Case 2",
    status: "Passed",
    time: "10ms",
    input: "nums = [3,2,4], target = 6",
    expected: "[1,2]",
    output: "[1,2]"
  },
  {
    title: "Test Case 3",
    status: "Passed",
    time: "11ms",
    input: "nums = [3,3], target = 6",
    expected: "[0,1]",
    output: "[0,1]"
  },
  {
    title: "Test Case 4",
    status: "Failed",
    time: "12ms",
    input: "nums = [1,2,3,4], target = 7",
    expected: "[2,3]",
    output: "[1,3]"
  },
  {
    title: "Test Case 5",
    status: "Failed",
    time: "11ms",
    input: "nums = [2,5,5,11], target = 10",
    expected: "[1,2]",
    output: "[0,2]"
  }
];

const testList = document.getElementById("testList");

function createTestCaseCard(test) {
  const card = document.createElement("div");

  card.className = `test-card ${test.status.toLowerCase()}`;

  const isPassed = test.status === "Passed";
  const icon = isPassed ? "✓" : "✕";

  card.innerHTML = `
    <div class="test-top">
      <div class="test-title-wrap">
        <div class="test-circle ${isPassed ? "passed" : "failed"}">
          ${icon}
        </div>

        <div>
          <div class="test-title">${test.title}</div>
          <div class="test-time">${test.time}</div>
        </div>
      </div>

      <div class="test-status ${isPassed ? "passed" : "failed"}">
        ${test.status}
      </div>
    </div>

    <div class="test-details">
      <div class="test-detail-row">
        <span class="detail-label">Input:</span>
        <span class="detail-value">${test.input}</span>
      </div>

      <div class="test-detail-row">
        <span class="detail-label">Expected:</span>
        <span class="detail-value">${test.expected}</span>
      </div>

      <div class="test-detail-row">
        <span class="detail-label">Your Output:</span>
        <span class="detail-value ${isPassed ? "correct-output" : "wrong-output"}">
          ${test.output}
        </span>
      </div>
    </div>
  `;

  return card;
}

function renderTestCases() {
  if (!testList) return;

  testList.innerHTML = "";

  testCases.forEach((test) => {
    const card = createTestCaseCard(test);
    testList.appendChild(card);
  });
}

renderTestCases();