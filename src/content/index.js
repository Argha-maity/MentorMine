let lastUrl = location.href;
let debounceTimer;

// Unified function to grab everything on the page
function scrapeFullContext() {
  const title = document.querySelector('div[data-cy="question-title"]')?.innerText || 
                document.querySelector('.text-title-large')?.innerText || 
                "Select a Problem";
                       
  const description = document.querySelector('[data-track-load="description_content"]')?.innerText || "";

  const lastError = document.querySelector('.text-red-600')?.innerText || 
                    document.querySelector('.console-error-message')?.innerText || 
                    null;

  const code = document.querySelector(".monaco-editor textarea")?.value || "";

  if (!chrome.runtime?.id) {
    console.log("MentorMine: Context invalidated, please refresh the page.");
    return;
  }

  chrome.runtime.sendMessage({
    type: "UPDATE_UI_DATA",
    data: { 
      title, 
      description, 
      lastError, 
      code, 
      url: window.location.href 
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("MentorMine: Connection lost (Extension updated).");
    }
  });
}

function debouncedUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(scrapeFullContext, 500);
}

const observer = new MutationObserver((mutations) => {
  if (mutations.length > 0) debouncedUpdate();
});
observer.observe(document.body, { childList: true, subtree: true });

function attachEditorListener() {
  const textarea = document.querySelector(".monaco-editor textarea");
  if (!textarea || textarea.dataset.mmAttached) return;

  textarea.dataset.mmAttached = "true";
  textarea.addEventListener("input", debouncedUpdate);
}

// Check for URL changes and attach editor listeners
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (location.pathname.includes("/problems/")) {
      console.log("MentorMine: Context Switched");
      setTimeout(scrapeFullContext, 1500);
    }
  }
  attachEditorListener();
}, 1000);

// Initial Load
window.addEventListener("load", () => setTimeout(scrapeFullContext, 2000));

// Handle direct requests from the Sidepanel
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "GET_LATEST_DATA") scrapeFullContext();
});