const challenge = {
  _id: "123",
  title: "Two Sum Problem",
  difficulty: "Easy",
  points: 75
};

const correctAnswer = "[0,1]";

const totalTests = 5;

const testTemplates = [
  {
    input: "nums = [2,7,11,15], target = 9",
    expectedOutput: "[0, 1]",
    time: "12ms"
  },
  {
    input: "nums = [3,2,4], target = 6",
    expectedOutput: "[0, 1]",
    time: "11ms"
  },
  {
    input: "nums = [3,3], target = 6",
    expectedOutput: "[0, 1]",
    time: "10ms"
  },
  {
    input: "nums = [1,5,8], target = 9",
    expectedOutput: "[0, 1]",
    time: "12ms"
  },
  {
    input: "nums = [4,4], target = 8",
    expectedOutput: "[0, 1]",
    time: "11ms"
  }
];

document.getElementById("challengeTitleBreadcrumb").textContent = challenge.title;
document.getElementById("maxRewardInfoText").textContent = `${challenge.points} Points`;
document.getElementById("difficultyLetter").textContent = challenge.difficulty.charAt(0).toUpperCase();
document.getElementById("difficultyText").textContent = challenge.difficulty;

showWaitingState();

document.getElementById("submitAnswerBtn").addEventListener("click", function () {
  const userAnswer = document.getElementById("userAnswerInput").value;

  const result = checkUserAnswer(userAnswer);

  renderResult(result);
});

document.getElementById("userAnswerInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const userAnswer = document.getElementById("userAnswerInput").value;

    const result = checkUserAnswer(userAnswer);

    renderResult(result);
  }
});

function normalizeAnswer(answer) {
  return answer
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/"/g, "")
    .replace(/'/g, "");
}

function checkUserAnswer(userAnswer) {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

  let passedTests;

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    passedTests = totalTests;
  } else {
    passedTests = 0;
  }

  const isPassed = passedTests === totalTests;

  const submission = {
    language: "JavaScript",
    passedTests: passedTests,
    totalTests: totalTests,
    status: isPassed ? "Accepted" : "Wrong Answer",
    earnedPoints: isPassed ? challenge.points : 0,
    executionTime: isPassed ? "11ms" : "13ms",
    memoryUsage: isPassed ? "42.3 MB" : "44.1 MB"
  };

  const testCases = testTemplates.map(function (testCase) {
    return {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: userAnswer.trim() === "" ? "No answer submitted" : userAnswer,
      status: isPassed ? "Passed" : "Failed",
      time: testCase.time
    };
  });

  return {
    submission: submission,
    testCases: testCases
  };
}

function showWaitingState() {
  const waitingSubmission = {
    language: "JavaScript",
    passedTests: 0,
    totalTests: totalTests,
    status: "Not Submitted",
    earnedPoints: 0,
    executionTime: "-",
    memoryUsage: "-"
  };

  const waitingTestCases = testTemplates.map(function (testCase) {
    return {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: "-",
      status: "Pending",
      time: "-"
    };
  });

  renderResult({
    submission: waitingSubmission,
    testCases: waitingTestCases
  });
}

function renderResult(result) {
  const submission = result.submission;
  const testCases = result.testCases;

  const passedTests = submission.passedTests;
  const totalTests = submission.totalTests;

  let isPassed;

  if (passedTests === totalTests) {
    isPassed = true;
  } else {
    isPassed = false;
  }

  const isPending = submission.status === "Not Submitted";

  const progressPercentage =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const earnedPoints = isPassed ? challenge.points : 0;

  const heroIcon = document.getElementById("heroIcon");
  const heroTitle = document.getElementById("heroTitle");

  heroIcon.classList.remove("failed", "waiting");

  if (isPending) {
    heroIcon.classList.add("waiting");
    heroIcon.innerHTML = `<i class="fa-solid fa-hourglass-half"></i>`;
    heroTitle.textContent = "Waiting for Submission";
  } else if (isPassed) {
    heroIcon.innerHTML = `<i class="fa-solid fa-check"></i>`;
    heroTitle.textContent = "All Tests Passed!";
  } else {
    heroIcon.classList.add("failed");
    heroIcon.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    heroTitle.textContent = "Submission Failed";
  }

  document.getElementById("passedTestsText").textContent = passedTests;
  document.getElementById("totalTestsText").textContent = totalTests;
  document.getElementById("earnedPointsText").textContent = earnedPoints;

  document.getElementById("languageText").textContent = submission.language;

  const statusText = document.getElementById("statusText");

  statusText.textContent = submission.status;
  statusText.classList.remove("accepted", "wrong", "pending");

  if (isPending) {
    statusText.classList.add("pending");
  } else if (isPassed) {
    statusText.classList.add("accepted");
  } else {
    statusText.classList.add("wrong");
  }

  document.getElementById("passedProgressText").textContent = passedTests;
  document.getElementById("totalProgressText").textContent = totalTests;

  const progressFill = document.getElementById("progressFill");
  progressFill.style.width = `${progressPercentage}%`;
  progressFill.classList.remove("failed-progress");

  if (!isPassed) {
    progressFill.classList.add("failed-progress");
  }

  document.getElementById("earnedInfoText").textContent = `${earnedPoints} Points`;

  const achievementBox = document.getElementById("achievementBox");
  const achievementTitle = document.getElementById("achievementTitle");
  const achievementMessage = document.getElementById("achievementMessage");

  achievementBox.classList.remove("failed-box");

  if (isPending) {
    achievementBox.classList.add("failed-box");

    achievementTitle.innerHTML = `
      <span class="achievement-check">
        <i class="fa-solid fa-hourglass-half"></i>
      </span>
      Not Submitted Yet
    `;

    achievementMessage.textContent =
      "Enter your answer and submit it to see your result.";
  } else if (isPassed) {
    achievementTitle.innerHTML = `
      <span class="achievement-check">
        <i class="fa-solid fa-check"></i>
      </span>
      Achievement Unlocked!
    `;

    achievementMessage.textContent =
      "You've successfully completed this challenge. Keep up the great work!";
  } else {
    achievementBox.classList.add("failed-box");

    achievementTitle.innerHTML = `
      <span class="achievement-check">
        <i class="fa-solid fa-xmark"></i>
      </span>
      Submission Incomplete
    `;

    achievementMessage.textContent =
      "You did not pass all test cases. Fix the failed cases and try again.";
  }

  document.getElementById("accuracyText").textContent = `${progressPercentage}%`;
  document.getElementById("executionTimeText").textContent = submission.executionTime;
  document.getElementById("memoryUsageText").textContent = submission.memoryUsage;

  const testList = document.getElementById("testList");
  testList.innerHTML = "";

  testCases.forEach(function (testCase, index) {
    let testPassed = false;
    let testPending = false;

    if (testCase.status === "Passed" || testCase.status === "Accepted") {
      testPassed = true;
    }

    if (testCase.status === "Pending") {
      testPending = true;
    }

    const testItem = document.createElement("div");
    testItem.className = "test-item";

    let iconClass;

    if (testPending) {
      iconClass = "fa-hourglass-half";
    } else if (testPassed) {
      iconClass = "fa-check";
    } else {
      iconClass = "fa-xmark";
    }

    testItem.innerHTML = `
      <div class="test-header">
        <div class="test-title">
          <span class="test-check ${testPending ? "pending" : testPassed ? "" : "failed"}">
            <i class="fa-solid ${iconClass}"></i>
          </span>
          Test Case ${index + 1}
        </div>

        <div class="test-meta">
          <span class="test-pill ${testPending ? "pending" : testPassed ? "" : "failed"}">
            ${testCase.status}
          </span>
          <span class="test-time">${testCase.time}</span>
        </div>
      </div>

      <div class="test-row-label">Input:</div>
      <div class="code-box">
        ${testCase.input}
      </div>

      <div class="output-grid">
        <div>
          <div class="test-row-label">Expected:</div>
          <div class="code-box">
            ${testCase.expectedOutput}
          </div>
        </div>

        <div>
          <div class="test-row-label">Your Output:</div>
          <div class="code-box">
            ${testCase.actualOutput}
          </div>
        </div>
      </div>
    `;

    testList.appendChild(testItem);
  });
}