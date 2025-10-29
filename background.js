
console.log("Briefly AI background starting...");

// Safe broadcast
function safeBroadcast(msg) {
  try {
    chrome.runtime.sendMessage(msg, () => {
      if (chrome.runtime.lastError) {
        // No receiver
        console.log("safeBroadcast: no receiver:", chrome.runtime.lastError.message);
      } else {
        console.log("safeBroadcast: delivered:", msg.type);
      }
    });
  } catch (err) {
    console.warn("safeBroadcast exception:", err);
  }
}

function formatSummaryPoints(lines) {
  return "📋 Chat Summary:\n\n" + lines.map(l => `• ${l}`).join("\n") + `\n\n⭐ Total messages analyzed: ${lines.length}`;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "SUMMARIZE") return false;

  (async () => {
    try {
      const messages = Array.isArray(msg.messages) ? msg.messages : [];
      console.log("Received", messages.length, "messages to summarize");

      const combinedText = messages.join("\n---\n");
      const aiAvailable = !!(chrome.ai?.summarizer?.summarize);

      if (aiAvailable) {
        try {
          // Use built-in summarizer (Gemini Nano) if available
          const summaryRes = await chrome.ai.summarizer.summarize({ text: combinedText, length: "short" });
          // Try to make a structured output with prompt API
          const structuredRes = await chrome.ai.prompt.generate({
            model: "gemini-nano",
            input: `Extract short bullet summary lines and action items from the messages below. Return plain text lines and a JSON object if possible.\n\nMessages:\n${combinedText}`
          });

          const replyRes = await chrome.ai.writer.generate({
            model: "gemini-nano",
            input: `Write a short polite reply acknowledging key points:\n\n${summaryRes?.text || structuredRes?.text || combinedText}`
          });

          await chrome.storage.local.set({
            summary: structuredRes?.text || summaryRes?.text || combinedText,
            structured: structuredRes || { summary: summaryRes?.text },
            reply: replyRes?.text || "",
            mode: "AI",
            timestamp: Date.now()
          });

          safeBroadcast({ type: "SUMMARY_DONE" });
          sendResponse({ ok: true, mode: "AI" });
          return;
        } catch (err) {
          console.warn("AI path failed, falling back to mock:", err);
          // continue to fallback
        }
      }

      // Mock fallback
      const recent = messages.slice(-10).map(m => m.replace(/\s+/g, " ").trim()).filter(Boolean);
      const summary = formatSummaryPoints(recent);

      const priority = /urgent|asap|today|immediately/i.test(summary) ? "High" : "Medium";
      const action_items = [];
      recent.forEach(r => {
        const m = r.match(/(review|send|update|deploy|fix|meeting|call)[\s\S]{0,80}/i);
        if (m && m[0]) action_items.push(m[0].trim());
      });

      const structured = { summary_points: recent, priority, action_items };

      const reply = (function genReply(list) {
        if (list.some(t => /meeting|schedule|connect/i.test(t))) return "Sure — I'll check availability and confirm.";
        if (list.some(t => /thanks|thank you/i.test(t))) return "You're welcome!";
        return "Thanks — noted!";
      })(recent);

      await chrome.storage.local.set({
        summary,
        structured,
        reply,
        mode: "Mock",
        timestamp: Date.now()
      });

      safeBroadcast({ type: "SUMMARY_DONE" });
      sendResponse({ ok: true, mode: "Mock" });
      return;
    } catch (err) {
      console.error("Summarization error:", err);
      try { sendResponse({ ok: false, error: String(err) }); } catch (e) {}
    }
  })();

  return true; // async
});

// keep-alive 
setInterval(() => console.debug("Briefly AI background Service"), 30000);

// Log AI check
if (chrome.ai?.summarizer) {
  console.log("Gemini Nano APIs available (AI Mode)");
} else {
  console.log("Gemini API not available (Mock Mode will be used)");
}
