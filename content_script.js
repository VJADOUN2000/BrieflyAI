

console.log("Briefly AI content script injected");

// Collect messages from Slack / WhatsApp
function collectMessages() {
  const slackSelectors = [
    'div.c-message__body',
    'div.p-rich_text_section',
    'div.c-message__content .p-rich_text_section',
    'span.c-message__body' // variants
  ];
  const waSelectors = [
    'div.copyable-text',
    'div.message-in span.selectable-text span',
    'div.message-out span.selectable-text span'
  ];

  const slackEls = Array.from(document.querySelectorAll(slackSelectors.join(','))).filter(Boolean);
  const waEls = Array.from(document.querySelectorAll(waSelectors.join(','))).filter(Boolean);

  const slackMsgs = slackEls.map(el => el.innerText?.trim() || "");
  const waMsgs = waEls.map(el => el.innerText?.trim() || "");

  return [...slackMsgs, ...waMsgs].filter(Boolean);
}

function safeSend(messages, maxRetries = 5, baseDelayMs = 600) {
  const trySend = (attempt) => {
    if (!chrome?.runtime?.id) {
      console.warn("safeSend: extension context invalidated; attempt", attempt);
      if (attempt < maxRetries) {
        setTimeout(() => trySend(attempt + 1), baseDelayMs);
      } else {
        alert("Extension inactive. Please reload the extension and try again.");
      }
      return;
    }

    try {
      chrome.runtime.sendMessage({ type: "SUMMARIZE", messages }, (res) => {
        if (chrome.runtime.lastError) {
          console.warn("safeSend lastError:", chrome.runtime.lastError.message);
          if (attempt < maxRetries) {
            setTimeout(() => trySend(attempt + 1), baseDelayMs * (attempt + 1));
          } else {
            alert("Could not contact background. Please reload the extension.");
          }
        } else {
          console.log("safeSend: delivered", res);
          //summarization started
          try { window.alert("Summarization started. Open Briefly AI popup in a few seconds to view results."); } catch(e) {}
        }
      });
    } catch (err) {
      console.error("safeSend exception:", err);
      if (attempt < maxRetries) setTimeout(() => trySend(attempt + 1), baseDelayMs);
      else alert("Unexpected error sending message. See console.");
    }
  };

  trySend(0);
}


function summarizeNow() {
  const messages = collectMessages();
  if (!messages.length) {
    alert("No messages found to summarize in this page.");
    return;
  }
  if (!confirm(`Summarize ${messages.length} messages now?`)) return;
  safeSend(messages);
}

// Listener
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "SUMMARY_DONE") {
    try {
      window.alert("✅ Briefly AI: Chat summary generated — open the popup to view it.");
    } catch (e) {
      console.log("SUMMARY_DONE received but failed to alert:", e);
    }
  }
});

// Add Button for Slack
let FAB = null;
function addSummarizeButton() {
  if (FAB) return;

  FAB = document.createElement("button");
  FAB.id = "briefly-fab";
  FAB.innerText = "🧠 Briefly";
  Object.assign(FAB.style, {
    position: "fixed",
    right: "20px",
    bottom: "100px",
    background: "#0B69FF",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    zIndex: 2147483647,
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    transition: "bottom 0.25s ease, right 0.25s ease"
  });

  FAB.addEventListener("click", summarizeNow);
  document.body.appendChild(FAB);
  adjustFabPosition();
  window.addEventListener("resize", adjustFabPosition);
  const obs = new MutationObserver(adjustFabPosition);
  obs.observe(document.body, { childList: true, subtree: true });

  // hover effect
  const style = document.createElement("style");
  style.textContent = `#briefly-fab:hover{ transform: translateY(-2px); background:#0957d0; }`;
  document.head.appendChild(style);
}

function adjustFabPosition() {
  if (!FAB) return;

  const composerSelectors = [
    'div.p-ia__composer', 'div.p-message_input', 'div.p-workspace__primary_view_footer',
    'footer[role="contentinfo"]', 'div._2A8P4'
  ];

  let composerRect = null;
  for (const s of composerSelectors) {
    const el = document.querySelector(s);
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.height > 30 && r.width > 100) { composerRect = r; break; }
    }
  }

  // detect sidebar width for Slack
  let leftOffset = 16;
  const sidebar = document.querySelector("div.p-workspace__sidebar") || document.querySelector("div.p-client_container div[role='navigation']");
  if (sidebar && sidebar.getBoundingClientRect) {
    const sr = sidebar.getBoundingClientRect();
    leftOffset = sr.width + 20;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

 
  const contentRightSafe = Math.max(20, 24);
  FAB.style.right = `${contentRightSafe}px`;

  
  let bottomPx = 100;
  if (composerRect) {
    const dist = vh - composerRect.top;
    bottomPx = dist + 12;
  }

  if (bottomPx > vh * 0.6) bottomPx = 120;

  FAB.style.bottom = `${bottomPx}px`;
}

addSummarizeButton();
