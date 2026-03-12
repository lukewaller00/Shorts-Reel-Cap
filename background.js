let lastUpdated = '';

async function checkDailyReset() {
  const now = new Date();
  const today = now.toDateString();
  const result = await chrome.storage.local.get(['lastUpdated', 'count']);
  
  if (result.lastUpdated !== today) {
    await chrome.storage.local.set({ count: 0, lastUpdated: today });
    return 0;
  }
  return result.count || 0;
}

chrome.runtime.onStartup.addListener(checkDailyReset);
chrome.runtime.onInstalled.addListener(checkDailyReset);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['count', 'limit', 'tracking'], (result) => {
      sendResponse({ 
        count: result.count || 0, 
        limit: result.limit || 30,
        tracking: result.tracking || { youtube: true, instagram: true, tiktok: true }
      });
    });
    return true;
  } else if (message.type === 'INCREMENT_COUNT') {
    checkDailyReset().then(() => {
      chrome.storage.local.get(['count', 'limit'], (result) => {
        const newCount = (result.count || 0) + 1;
        const limit = result.limit || 30;
        chrome.storage.local.set({ count: newCount }, () => {
          sendResponse({ count: newCount, limit: limit });
        });
      });
    });
    return true;
  } else if (message.type === 'EXTEND_LIMIT') {
    chrome.storage.local.get(['limit'], (result) => {
      const newLimit = (result.limit || 30) + 10;
      chrome.storage.local.set({ limit: newLimit }, () => {
        sendResponse({ success: true, newLimit: newLimit });
      });
    });
    return true;
  }
});
