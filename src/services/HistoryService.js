export const saveToHistory = (problemTitle, type, content) => {
  const entry = {
    id: Date.now(),
    title: problemTitle,
    type: type, // 'hint' or 'chat'
    content: content,
    timestamp: new Date().toLocaleString(),
  };

  chrome.storage.local.get(["history"], (result) => {
    const history = result.history || [];
    // Keep only the last 50 items to save space
    const updatedHistory = [entry, ...history].slice(0, 50); 
    chrome.storage.local.set({ history: updatedHistory });
  });
};