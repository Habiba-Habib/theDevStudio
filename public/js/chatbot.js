document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("chatbotToggle");
  const windowEl = document.getElementById("chatbotWindow");
  const closeBtn = document.getElementById("chatbotClose");
  const minimizeBtn = document.getElementById("chatbotMinimize");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");
  const quickActions = document.getElementById("quickActions");

  if (!toggle || !windowEl || !form || !input || !messages) return;

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function openChat() {
    windowEl.classList.add("open");
    windowEl.setAttribute("aria-hidden", "false");
    input.focus();
  }

  function closeChat() {
    windowEl.classList.remove("open");
    windowEl.setAttribute("aria-hidden", "true");
  }

  function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = "chatbot-row " + (sender === "user" ? "user-row" : "bot-row");

    if (sender === "bot") {
      row.innerHTML = `
        <div class="bot-mini-avatar">
          <i class="fa-solid fa-headset"></i>
        </div>
        <div>
          <div class="chatbot-message bot"></div>
          <div class="chatbot-time">${getTime()}</div>
        </div>
      `;
      row.querySelector(".chatbot-message").textContent = text;
    } else {
      row.innerHTML = `
        <div>
          <div class="chatbot-message user"></div>
          <div class="chatbot-time">${getTime()}</div>
        </div>
      `;
      row.querySelector(".chatbot-message").textContent = text;
    }

    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;

    return row;
  }

  function addTypingIndicator() {
    const row = document.createElement("div");
    row.className = "chatbot-row bot-row";

    row.innerHTML = `
      <div class="bot-mini-avatar">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
      </div>
      <div class="chatbot-message bot typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;

    return row;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;

    quickActions?.remove();

    addMessage(text, "user");
    input.value = "";

    const typingRow = addTypingIndicator();

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      setTimeout(function () {
        typingRow.remove();
        addMessage(data.reply || "I could not find an answer.", "bot");
      }, 500);
    } catch (error) {
      console.error("Chatbot request failed:", error);

      setTimeout(function () {
        typingRow.remove();
        addMessage("Sorry, I could not connect right now.", "bot");
      }, 500);
    }
  }

  toggle.addEventListener("click", function () {
    if (windowEl.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn?.addEventListener("click", closeChat);
  minimizeBtn?.addEventListener("click", closeChat);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage(input.value.trim());
  });

  document.querySelectorAll(".quick-actions-grid button").forEach(function (button) {
    button.addEventListener("click", function () {
      const message = button.getAttribute("data-message");
      sendMessage(message);
    });
  });
});