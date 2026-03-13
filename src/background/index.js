const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY; 
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

let latestLeetCodeData = null;
const aiCache = new Map();

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (err) {
    console.error("Side panel failed:", err);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true; 
});

async function handleMessage(message, sendResponse) {
  try {
    if (message.type === "UPDATE_UI_DATA") {
      latestLeetCodeData = message.data;
      chrome.runtime.sendMessage({
        type: "UPDATE_UI_DATA",
        data: latestLeetCodeData
      }).catch(() => { /* Sidepanel might be closed */ });
      return sendResponse({ ok: true });
    }

    if (message.type === "GET_LATEST_DATA") {
      return sendResponse(latestLeetCodeData);
    }

    if (message.type === "GET_AI_HINT") {
      const { title, code, description, lastError } = message.payload || {};
      if (!title || !code) return sendResponse({ error: "Missing input" });

      const cacheKey = `${title}-${code}-${lastError || 'no-error'}`;
      if (aiCache.has(cacheKey)) return sendResponse(aiCache.get(cacheKey));

      const result = await generateHint(title, code, description, lastError);
      aiCache.set(cacheKey, result);
      return sendResponse(result);
    }

    if (message.type === "SEND_CHAT_MESSAGE") {
      handleChat(message.payload).then(reply => sendResponse({ reply }));
      return true;
    }
  } catch (err) {
    console.error("Background Error:", err);
    sendResponse({ error: "Internal error" });
  }
}

async function generateHint(title, code, description, error) {
  const systemPrompt = `You are a coding mentor. Return ONLY a raw JSON object: {"nudge": "...", "direction": "...", "approach": "..."}.
  Address the specific error if provided: ${error || 'None'}. 
  Do not give full code.`;

  const userPrompt = `Problem: ${title}\nDescription: ${description}\nCode:\n${code}\nError: ${error || "None"}`;

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });
    const result = await response.json();
    return { hint: JSON.parse(result.choices[0].message.content) };
  } catch (e) {
    return { hint: { nudge: "Error", direction: "AI Offline", approach: "Try again later" }};
  }
}

async function handleChat(payload) {
  const { messages, code, title, description, lastError } = payload;
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are MentorMine. User solving ${title}. Error: ${lastError || "None"}. Code: ${code}. Never give full solutions.` 
          },
          ...messages
        ]
      })
    });
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (e) {
    return "Connection lost. Please try again.";
  }
}