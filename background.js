if (typeof importScripts === 'function') {
  importScripts('browser-polyfill.js');
}

let lastUpdated = '';

async function checkDailyReset() {
  const now = new Date();
  const today = now.toDateString();
  const result = await browser.storage.local.get(['lastUpdated', 'count']);
  
  if (result.lastUpdated !== today) {
    await browser.storage.local.set({ count: 0, lastUpdated: today });
    return 0;
  }
  return result.count || 0;
}

browser.runtime.onStartup.addListener(checkDailyReset);
browser.runtime.onInstalled.addListener(checkDailyReset);

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'GET_STATUS') {
    return browser.storage.local.get(['count', 'limit', 'tracking']).then((result) => {
      return { 
        count: result.count || 0, 
        limit: result.limit || 30,
        tracking: result.tracking || { youtube: true, instagram: true, tiktok: true, facebook: true }
      };
    });
  } else if (message.type === 'INCREMENT_COUNT') {
    return checkDailyReset().then(() => {
      return browser.storage.local.get(['count', 'limit']).then((result) => {
        const newCount = (result.count || 0) + 1;
        const limit = result.limit || 30;
        return browser.storage.local.set({ count: newCount }).then(() => {
          return { count: newCount, limit: limit };
        });
      });
    });
  } else if (message.type === 'EXTEND_LIMIT') {
    return browser.storage.local.get(['limit']).then((result) => {
      const newLimit = (result.limit || 30) + 10;
      return browser.storage.local.set({ limit: newLimit }).then(() => {
        return { success: true, newLimit: newLimit };
      });
    });
  }
});
