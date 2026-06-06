// ── LINE NUMBERS ──
function updateLineNumbers() {
  const editor   = document.getElementById('codeEditor');
  const lineNums = document.getElementById('lineNums');
  if (!editor || !lineNums) return;
  const lines = editor.value.split('\n').length;
  lineNums.innerHTML = Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
}

document.getElementById('codeEditor')?.addEventListener('input', updateLineNumbers);
document.getElementById('codeEditor')?.addEventListener('scroll', () => {
  const lineNums = document.getElementById('lineNums');
  if (lineNums) lineNums.scrollTop = document.getElementById('codeEditor').scrollTop;
});
updateLineNumbers();

// ── LANGUAGE STARTER TEMPLATES ──
const templates = {
  js: `var solution = function(...args) {
  // Your code here

};`,

  python:  `def solution():\n    # Write your solution here\n    pass`,

  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n\n    return 0;\n}`,
};

function changeLang() {
  document.getElementById('codeEditor').value = templates[document.getElementById('langSelect').value] || '';
  updateLineNumbers();
  clearConsole();
}

// ── CONSOLE HELPERS ──
function clearConsole() {
  const output      = document.getElementById('consoleOutput');
  const placeholder = document.getElementById('consolePlaceholder');
  output.innerHTML      = '';
  output.style.display  = 'none';
  placeholder.style.display = 'block';
}

function printToConsole(html) {
  const output      = document.getElementById('consoleOutput');
  const placeholder = document.getElementById('consolePlaceholder');
  placeholder.style.display = 'none';
  output.style.display      = 'block';
  output.innerHTML         += html;
}

function testRow(index, result) {
  const color = result.passed ? '#2dd4bf' : '#ff6b8a';
  const icon  = result.passed ? '✔' : '✘';
  const label = result.passed ? 'Correct' : 'Wrong Answer';
  return `
    <div style="border:1px solid ${color}33; border-radius:8px; padding:10px 14px; margin-bottom:10px;">
      <div style="color:${color}; font-weight:700; margin-bottom:6px;">${icon} Test Case ${index + 1} — ${label}</div>
      <div style="color:#8b92a5; font-size:12px; line-height:1.8;">
        <span style="color:#c4cad8;">Input:</span> ${result.input}<br/>
        <span style="color:#c4cad8;">Expected:</span> ${result.expected}<br/>
        <span style="color:#c4cad8;">Your Output:</span> <span style="color:${color}">${result.actual || '(no output)'}</span>
        ${result.error ? `<br/><span style="color:#ff6b8a;">Error: ${result.error}</span>` : ''}
      </div>
    </div>`;
}

// ── RUN CODE ──
async function runCode() {
  const code     = document.getElementById('codeEditor').value.trim();
  const language = document.getElementById('langSelect').value;

  if (!code) {
    clearConsole();
    printToConsole(`<div style="color:#FFB7E6;">⚠ Please write some code first.</div>`);
    return;
  }

  clearConsole();
  printToConsole(`<div style="color:#8b92a5; margin-bottom:10px;">⏳ Running against visible test cases...</div>`);

  try {
    const res  = await fetch(window.RUN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, language })
    });
    const data = await res.json();

    document.getElementById('consoleOutput').innerHTML = '';

    if (data.error) {
      printToConsole(`<div style="color:#ff6b8a;">✘ ${data.error}</div>`);
      return;
    }

    const passed = data.results.filter(r => r.passed).length;
    const total  = data.results.length;

    printToConsole(`<div style="color:#c4cad8; font-weight:600; margin-bottom:12px;">Results: ${passed}/${total} test cases passed</div>`);
    data.results.forEach((r, i) => printToConsole(testRow(i, r)));

    if (passed === total) {
      printToConsole(`<div style="color:#2dd4bf; font-weight:700; margin-top:4px;">🎉 All visible tests passed! Click Submit Solution to finalize.</div>`);
    }

  } catch (err) {
    document.getElementById('consoleOutput').innerHTML = '';
    printToConsole(`<div style="color:#ff6b8a;">✘ Network error: ${err.message}</div>`);
  }
}

// ── SUBMIT SOLUTION ──
async function submitSolution(challengeId) {
  const code     = document.getElementById('codeEditor').value.trim();
  const language = document.getElementById('langSelect').value;

  if (!code) {
    clearConsole();
    printToConsole(`<div style="color:#FFB7E6;">⚠ Please write some code before submitting.</div>`);
    return;
  }

  const btn = document.getElementById('submitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

  try {
    const res  = await fetch(window.SUBMIT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, language })
    });
    const data = await res.json();

    if (data.error) {
      clearConsole();
      printToConsole(`<div style="color:#ff6b8a;">✘ ${data.error}</div>`);
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Solution'; }
      return;
    }

    if (data.redirect) {
      window.location.href = data.redirect;
    }

  } catch (err) {
    clearConsole();
    printToConsole(`<div style="color:#ff6b8a;">✘ Network error: ${err.message}</div>`);
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Solution'; }
  }
}
