# **Briefly AI - Chrome Extension**

<p align="center">
  <img src="icons/icon128.png" alt="Briefly AI Logo" width="120"/>
</p>

**Briefly AI** — an intelligent Chrome extension that summarizes Slack and WhatsApp Web chats into clean, actionable insights using **Chrome’s on-device Gemini Nano AI** or a local fallback summarizer.

---

## Description

**Briefly AI** is designed to save you from reading long message threads.
It automatically scans active **Slack** or **WhatsApp Web** conversations, summarizes all messages, highlights key action items, sets priorities, and even suggests professional replies — all within seconds.

Built using **Chrome’s Built-in AI APIs (Gemini Nano)**, it runs entirely on-device for privacy, low latency, and offline performance.
If Gemini Nano isn’t available, Briefly AI seamlessly switches to **Mock Mode** — a local summarizer ensuring uninterrupted functionality.

---

## Features

### Core Functionality

* **One-Click Chat Summarization** → Summarize active chat instantly.
* **Priority Detection** → Automatically classify important messages.
* **Action Item Extraction** → Highlight tasks or decisions from chats.
* **Suggested Replies** → Generate polite and context-aware responses.
* **Proofreading Support** → Enhance message tone and grammar using Chrome’s AI Proofreader.

---

### Advanced AI Capabilities

* **Gemini Nano Integration:** Leverages Chrome’s built-in on-device model (`chrome.ai.summarizer`, `chrome.ai.writer`, `chrome.ai.proofreader`).
* **Offline Mock Mode:** Works locally when AI APIs are unavailable.
* **Privacy First:** 100% on-device — no external API calls or data storage.
* **Auto Detection:** Displays current AI mode (ON / OFF) in the popup.

---

### User Experience

* Floating **Summarize Chat** button inside Slack/WhatsApp UI.
* Elegant **Popup Dashboard** showing:

  * Summarized messages
  * Priority level
  * Action items
  * Suggested reply
* Live **AI Diagnostics** (Summarizer, Writer, Proofreader indicators).
* Smart alert feedback — *e.g.*, “Summary generated successfully”.

---

## Project Structure

```
briefly-ai/
├── icons/                     # Extension icons (16px, 48px, 128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── background.js              # Handles summarization logic & AI API calls
├── content_script.js          # Extracts messages from Slack / WhatsApp DOM
├── manifest.json              # Chrome Manifest V3 configuration
│
├── popup.html                 # Popup UI layout
├── popup.js                   # Handles popup interactions and AI diagnostics
├── style.css                  # Popup styling (light & clean layout)
│
└── README.md                  # Project documentation
```

---

## Installation

### Method 1 — From Source (Developer Mode)

1. Clone the repository:

   ```bash
   git clone https://github.com/VJADOUN2000/BriedflyAI.git
   cd BrieflyAI
   ```
2. Open Chrome and navigate to:

   ```
   chrome://extensions/
   ```
3. Enable **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the `briefly-ai/` folder.
5. The **Briefly AI** icon will appear in your Chrome toolbar.

---

## 🧪 How It Works

1. Open **Slack** or **WhatsApp Web** in Chrome.
2. Click the floating **Summarize Chat** button.
3. The extension extracts recent visible messages.
4. The background script determines AI availability:

   * **Gemini Nano active** → uses Chrome’s on-device AI APIs.
   * **Fallback active** → uses built-in summarization logic.
5. Results appear in the popup instantly.

---

## AI Mode Detection

| Mode                             | Description                                  |
| -------------------------------- | -------------------------------------------- |
| **AI Mode: ON (Gemini Nano)** | Running on Chrome’s on-device AI APIs        |
| **AI Mode: OFF (Mock)**       | Fallback for browsers without Gemini support |

---

## 🤖 APIs Utilized

* **Summarizer API** — Condenses chat content into concise summaries.
* **Writer API** — Creates professional, context-aware replies.
* **Proofreader API** — Improves grammar and tone.
* **Prompt API** — Extracts structured data from chat content.

---

## 💡 Example Use Case

> You return from a meeting and see 150 unread Slack messages.
> Instead of scrolling endlessly, click **Summarize Chat**:

```
Chat Summary:
• Discussed campaign launch deadlines  
• Marketing post scheduled for 9:30 PM  
• Need approval from Rajat by EOD  
Priority: High  
Suggested Reply: "Thanks for the update — noted! Will review by evening."
```

No more manual reading — get clarity in seconds.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

* [Chrome Developers Docs - Built-in AI APIs](https://developer.chrome.com/docs/ai/)
* [Gemini Nano Overview](https://ai.google.dev/gemini)
* [Slack Web](https://slack.com/)
* [WhatsApp Web](https://web.whatsapp.com/)

---

**Made with ❤️ for productivity and simplicity**
💬 *Briefly AI — Let AI read your messages, so you don’t have to.*

---


