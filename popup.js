
async function loadSummary() {
  const data = await chrome.storage.local.get(["summary", "structured", "reply", "mode"]);
  document.getElementById("summary").textContent = data.summary || "No summary yet.";
  document.getElementById("priority").textContent = data.structured?.priority || "N/A";

  const listContainer = document.getElementById("actions");
  listContainer.innerHTML = "";

  const items = data.structured?.action_items || (Array.isArray(data.structured?.summary_points) ? data.structured.summary_points : []);
  if (items && items.length) {
    const pre = document.createElement("pre");
    pre.className = "action-block";
    pre.textContent = items.map(i => `• ${i}`).join("\n");
    listContainer.appendChild(pre);
  } else {
    const pre = document.createElement("pre");
    pre.className = "action-block";
    pre.textContent = "No specific action items detected.";
    listContainer.appendChild(pre);
  }

  document.getElementById("reply").value = data.reply || "";
  document.getElementById("mode").textContent = data.mode === "AI" ? "🧠 AI Mode: ON (Gemini Nano)" : "⚙️ AI Mode: OFF (Mock)";
}

document.getElementById("proofread").addEventListener("click", async () => {
  const txt = document.getElementById("reply").value.trim();
  if (!txt) return alert("No text to proofread!");
  try {
    if (chrome.ai?.proofreader?.proofread) {
      const proof = await chrome.ai.proofreader.proofread({ text: txt });
      document.getElementById("reply").value = proof.correctedText || proof.text || txt;
      alert("✅ Proofread (AI) complete.");
    } else {
      const corrected = txt.replace(/\bi\s/g, " I ").replace(/\bu\b/gi, "you").replace(/\bpls\b/gi, "please");
      document.getElementById("reply").value = corrected;
      alert("✅ Proofread (Mock) complete.");
    }
  } catch (e) {
    console.error("Proofread error:", e);
    alert(" Proofread failed. See console.");
  }
});

document.getElementById("resummarize").addEventListener("click", async () => {
  if (!confirm("Summarize again?")) return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return alert("No active tab.");
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => window.dispatchEvent(new CustomEvent("triggerSummarize"))
    });
  });
  alert("🔄 Re-summarization started. Wait a few seconds and reopen popup.");
  setTimeout(loadSummary, 3500);
});

// AI Diagnostic
async function checkGeminiStatus() {
  const statusEl = document.getElementById("ai-status");
  const resultEl = document.getElementById("ai-result");
  if (!chrome?.ai) {
    statusEl.textContent = "AI Mode: OFF (chrome.ai missing)";
    statusEl.style.background = "#f8d7da"; statusEl.style.color = "#721c24";
    resultEl.textContent = "chrome.ai not present. Enable Canary + flags + model to run on-device AI.";
    return;
  }

  const hasSumm = !!chrome.ai.summarizer;
  const hasW = !!chrome.ai.writer;
  const hasP = !!chrome.ai.prompt;
  const hasPR = !!chrome.ai.proofreader;

  if (hasSumm && hasW && hasP && hasPR) {
    statusEl.textContent = "AI Mode: ✅ ON (Gemini Nano)";
    statusEl.style.background = "#e6ffed"; statusEl.style.color = "#0a7a2f";
  } else {
    statusEl.textContent = "AI Mode: ⚠️ PARTIAL";
    statusEl.style.background = "#fff4e5"; statusEl.style.color = "#7a5b00";
  }
  resultEl.textContent = `Summarizer:${hasSumm?"✅":"❌"} Writer:${hasW?"✅":"❌"} Prompt:${hasP?"✅":"❌"} Proof:${hasPR?"✅":"❌"}`;
}

async function runGeminiTest() {
  const resultEl = document.getElementById("ai-result");
  if (!chrome?.ai?.summarizer) {
    alert("Gemini Nano not available. Enable Canary + flags + model.");
    return;
  }
  resultEl.textContent = "Running Gemini Nano test...";
  try {
    const r = await chrome.ai.summarizer.summarize({
      text: "Gemini Nano test: summarize this short sentence.",
      length: "short"
    });
    resultEl.innerHTML = `Gemini response:<br><em>${r.text || r}</em>`;
  } catch (err) {
    resultEl.textContent = `Test failed: ${err.message || err}`;
  }
}

document.getElementById("ai-test").addEventListener("click", runGeminiTest);


loadSummary();
checkGeminiStatus();
