document.addEventListener('DOMContentLoaded', () => {
  const limitInput = document.getElementById('limit');
  const saveBtn = document.getElementById('save');
  const resetBtn = document.getElementById('reset');
  const progressText = document.getElementById('progress-text');
  const circularBar = document.getElementById('circular-bar');
  const statusMessage = document.getElementById('status-message');
  const toast = document.getElementById('toast');
  
  // Navigation
  const statsBtn = document.getElementById('stats-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const backBtn = document.getElementById('back-btn');
  const mainView = document.getElementById('main-view');
  const statsView = document.getElementById('stats-view');
  const settingsView = document.getElementById('settings-view');
  const viewTitle = document.getElementById('view-title');

  // Settings View Elements
  const extIncrementInput = document.getElementById('ext-increment');
  const saveSettingsBtn = document.getElementById('save-settings');
  const themeSelect = document.getElementById('theme-select');

  // Platform toggles
  const trackYt = document.getElementById('track-yt');
  const trackIg = document.getElementById('track-ig');
  const trackTt = document.getElementById('track-tt');
  const trackFb = document.getElementById('track-fb');

  // Load current settings
  browser.storage.local.get(['limit', 'count', 'tracking', 'extensionIncrement', 'theme']).then((result) => {
    const limit = result.limit || 30;
    const count = result.count || 0;
    const tracking = result.tracking || { youtube: true, instagram: true, tiktok: true, facebook: true };
    const extIncrement = result.extensionIncrement || 10;
    const theme = result.theme || 'light';
    
    limitInput.value = limit;
    extIncrementInput.value = extIncrement;
    themeSelect.value = theme;
    document.body.setAttribute('data-theme', theme);
    
    trackYt.checked = tracking.youtube !== false;
    trackIg.checked = tracking.instagram !== false;
    trackTt.checked = tracking.tiktok !== false;
    trackFb.checked = tracking.facebook !== false;
    
    updateUI(count, limit);
  });

  function showToast(message) {
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Navigation Logic
  function showView(viewName) {
    mainView.classList.remove('active');
    statsView.classList.remove('active');
    settingsView.classList.remove('active');
    
    statsBtn.style.display = 'none';
    settingsBtn.style.display = 'none';
    backBtn.style.display = 'flex';

    if (viewName === 'stats') {
      statsView.classList.add('active');
      viewTitle.innerText = 'Usage Stats';
      renderStats();
    } else if (viewName === 'settings') {
      settingsView.classList.add('active');
      viewTitle.innerText = 'Settings';
    }
  }

  statsBtn.addEventListener('click', () => showView('stats'));
  settingsBtn.addEventListener('click', () => showView('settings'));

  backBtn.addEventListener('click', () => {
    statsView.classList.remove('active');
    settingsView.classList.remove('active');
    mainView.classList.add('active');
    
    statsBtn.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    backBtn.style.display = 'none';
    viewTitle.innerText = 'ReelsCap';
  });

  async function renderStats() {
    const result = await browser.storage.local.get(['dailyStats']);
    const dailyStats = result.dailyStats || {};
    const now = new Date();
    const todayStr = now.toDateString();
    
    const hours = dailyStats[todayStr] || new Array(24).fill(0);
    
    let peakHour = -1;
    let maxCount = 0;
    let morning = 0, afternoon = 0, evening = 0, night = 0;

    hours.forEach((count, h) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = h;
      }
      if (h >= 6 && h < 12) morning += count;
      else if (h >= 12 && h < 18) afternoon += count;
      else if (h >= 18 && h <= 23) evening += count;
      else night += count;
    });

    document.getElementById('morning-count').innerText = morning;
    document.getElementById('afternoon-count').innerText = afternoon;
    document.getElementById('evening-count').innerText = evening;
    document.getElementById('night-count').innerText = night;
    
    const peakText = peakHour === -1 ? '-' : `${peakHour}:00 - ${peakHour + 1}:00`;
    document.getElementById('peak-time').innerText = peakText;

    const chartContainer = document.getElementById('hourly-chart');
    chartContainer.innerHTML = '';
    
    const maxBarHeight = 160;
    const scale = maxCount > 0 ? maxBarHeight / maxCount : 0;

    hours.forEach((count, h) => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${Math.max(1, count * scale)}px`;
      bar.title = `${h}:00 - ${count} reels`;
      
      if (h % 4 === 0) {
        const label = document.createElement('span');
        label.className = 'chart-label';
        label.innerText = `${h}h`;
        bar.appendChild(label);
      }
      chartContainer.appendChild(bar);
    });
  }

  saveBtn.addEventListener('click', () => {
    const newLimit = parseInt(limitInput.value) || 30;
    const tracking = {
      youtube: trackYt.checked,
      instagram: trackIg.checked,
      tiktok: trackTt.checked,
      facebook: trackFb.checked
    };

    browser.storage.local.set({ limit: newLimit, tracking: tracking }).then(() => {
      showToast('Daily limit and tracking saved!');
      return browser.storage.local.get(['count']);
    }).then((result) => {
      updateUI(result.count || 0, newLimit);
    });
  });

  saveSettingsBtn.addEventListener('click', () => {
    const increment = parseInt(extIncrementInput.value) || 10;
    const theme = themeSelect.value;
    
    browser.storage.local.set({ 
      extensionIncrement: increment,
      theme: theme
    }).then(() => {
      document.body.setAttribute('data-theme', theme);
      showToast('Settings applied!');
    });
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset today\'s count and all history?')) {
      browser.storage.local.set({ count: 0, dailyStats: {} }).then(() => {
        showToast('Data reset successfully!');
        return browser.storage.local.get(['limit']);
      }).then((result) => {
        const limit = result.limit || 30;
        updateUI(0, limit);
        if (statsView.classList.contains('active')) renderStats();
      });
    }
  });

  function updateUI(count, limit) {
    progressText.innerHTML = `<strong>${count}</strong> / ${limit}`;
    const remaining = Math.max(0, limit - count);
    if (count >= limit) {
      statusMessage.innerHTML = `Current Status: Limit Reached! <strong>0 left</strong>`;
    } else {
      statusMessage.innerHTML = `Current Status: Watch responsibly! <strong>${remaining} left</strong>`;
    }

    const percentage = Math.min((count / limit) * 100, 100);
    const degrees = (percentage / 100) * 360;
    
    let color = '#a8e063';
    if (count >= limit) color = '#ff0000';
    else if (count >= limit * 0.8) color = '#ffa500';

    const progressBg = getComputedStyle(document.documentElement).getPropertyValue('--progress-bg').trim() || '#eeeeee';
    circularBar.style.background = `conic-gradient(${color} ${degrees}deg, ${progressBg} ${degrees}deg)`;
  }

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      browser.storage.local.get(['count', 'limit', 'theme']).then((result) => {
        if (result.theme) document.body.setAttribute('data-theme', result.theme);
        updateUI(result.count || 0, result.limit || 30);
        if (statsView.classList.contains('active')) renderStats();
      });
    }
  });
});