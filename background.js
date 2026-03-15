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
      return browser.storage.local.get(['count', 'limit', 'dailyStats']).then((result) => {
        const newCount = (result.count || 0) + 1;
        const limit = result.limit || 30;
        
        // Bucketed History Logic
        const now = new Date();
        const dateKey = now.toDateString();
        const hour = now.getHours();
        
        let dailyStats = result.dailyStats || {};
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = new Array(24).fill(0);
        }
        dailyStats[dateKey][hour]++;

        return browser.storage.local.set({ count: newCount, dailyStats: dailyStats }).then(() => {
          return { count: newCount, limit: limit };
        });
      });
    });
  } else if (message.type === 'EXTEND_LIMIT') {
    return browser.storage.local.get(['limit', 'extensionIncrement']).then((result) => {
      const increment = result.extensionIncrement || 10;
      const newLimit = (result.limit || 30) + increment;
      return browser.storage.local.set({ limit: newLimit }).then(() => {
        return { success: true, newLimit: newLimit };
      });
    });
  }
});
