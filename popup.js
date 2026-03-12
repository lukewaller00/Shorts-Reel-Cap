document.addEventListener('DOMContentLoaded', () => {
  const limitInput = document.getElementById('limit');
  const saveBtn = document.getElementById('save');
  const resetBtn = document.getElementById('reset');
  const progressText = document.getElementById('progress-text');
  const circularBar = document.getElementById('circular-bar');
  const statusMessage = document.getElementById('status-message');
  
  // Platform toggles
  const trackYt = document.getElementById('track-yt');
  const trackIg = document.getElementById('track-ig');
  const trackTt = document.getElementById('track-tt');

  // Load current settings
  chrome.storage.local.get(['limit', 'count', 'tracking'], (result) => {
    const limit = result.limit || 30;
    const count = result.count || 0;
    const tracking = result.tracking || { youtube: true, instagram: true, tiktok: true };
    
    limitInput.value = limit;
    trackYt.checked = tracking.youtube !== false;
    trackIg.checked = tracking.instagram !== false;
    trackTt.checked = tracking.tiktok !== false;
    
    updateUI(count, limit);
  });

  saveBtn.addEventListener('click', () => {
    const newLimit = parseInt(limitInput.value) || 30;
    const tracking = {
      youtube: trackYt.checked,
      instagram: trackIg.checked,
      tiktok: trackTt.checked
    };

    chrome.storage.local.set({ limit: newLimit, tracking: tracking }, () => {
      alert('Settings saved!');
      chrome.storage.local.get(['count'], (result) => {
        const count = result.count || 0;
        updateUI(count, newLimit);
      });
    });
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.local.set({ count: 0 }, () => {
      chrome.storage.local.get(['limit'], (result) => {
        const limit = result.limit || 30;
        updateUI(0, limit);
      });
    });
  });

  function updateUI(count, limit) {
    // 1. Update the center text (e.g., 11 / 30)
    progressText.innerHTML = `<strong>${count}</strong> / ${limit}`;

    // 2. Update the status text (calculating remaining)
    const remaining = Math.max(0, limit - count);
    if (count >= limit) {
      statusMessage.innerHTML = `Current Status: Limit Reached! <strong>0 left</strong>`;
    } else {
      statusMessage.innerHTML = `Current Status: Watch more responsibly! <strong>${remaining} left</strong>`;
    }

    // 3. Update the circular progress bar (conic-gradient)
    const percentage = Math.min((count / limit) * 100, 100);
    const degrees = (percentage / 100) * 360;
    
    // Color code if near or over limit
    let color = '#a8e063'; // Nice green
    if (count >= limit) {
      color = '#ff0000'; // Red
    } else if (count >= limit * 0.8) {
      color = '#ffa500'; // Orange
    }

    circularBar.style.background = `conic-gradient(${color} ${degrees}deg, #eee ${degrees}deg)`;
  }
});
