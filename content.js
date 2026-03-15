let localCount = 0;
let localLimit = 30;
let localTracking = { youtube: true, instagram: true, tiktok: true, facebook: true };
let lastVideoId = '';
let overlayVisible = false;

// Helper to check if the extension context is still valid
function isContextValid() {
  return typeof browser !== 'undefined' && browser.runtime && !!browser.runtime.id;
}

// Improved function to find the active video element
function getActiveVideo() {
  const host = window.location.host;
  
  if (host.includes('tiktok.com')) {
    const videos = document.querySelectorAll('video');
    for (let v of videos) {
      const rect = v.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (isVisible && v.offsetWidth > 0) return v;
    }
  }
  
  if (host.includes('instagram.com') || host.includes('facebook.com')) {
    const videos = document.querySelectorAll('video');
    for (let v of videos) {
      const rect = v.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) return v;
    }
  }

  return document.querySelector('video');
}

function getUniqueVideoId() {
  const url = window.location.href;
  
  if (url.includes('youtube.com/shorts/')) {
    return url.split('/shorts/')[1].split('?')[0];
  }
  
  if (url.includes('tiktok.com/')) {
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (videoIdMatch) return videoIdMatch[1];
    const video = getActiveVideo();
    return video ? video.src.split('?')[0] : '';
  }
  
  if (url.includes('instagram.com/reel')) {
    const splitKey = url.includes('/reels/') ? '/reels/' : '/reel/';
    const parts = url.split(splitKey);
    return parts.length > 1 ? parts[1].split('/')[0].split('?')[0] : '';
  }

  if (url.includes('facebook.com/reels/') || url.includes('facebook.com/reel/')) {
    const splitKey = url.includes('/reels/') ? '/reels/' : '/reel/';
    const parts = url.split(splitKey);
    return parts.length > 1 ? parts[1].split('/')[0].split('?')[0] : '';
  }
  
  return '';
}

function getCurrentPlatform() {
  const host = window.location.host;
  if (host.includes('youtube.com')) return 'youtube';
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('facebook.com')) return 'facebook';
  return null;
}

function isTrackingEnabled() {
  const platform = getCurrentPlatform();
  if (!platform) return false;
  return localTracking[platform] !== false;
}

function isVideoPage() {
  const host = window.location.host;
  const url = window.location.href;
  if (host.includes('youtube.com') && url.includes('/shorts/')) return true;
  if (host.includes('tiktok.com')) return true;
  if (host.includes('instagram.com') && url.includes('/reel')) return true;
  if (host.includes('facebook.com') && (url.includes('/reels/') || url.includes('/reel/'))) return true;
  return false;
}

function pauseVideo() {
  const video = getActiveVideo();
  if (video) {
    video.pause();
    video.muted = true;
  }
}

function showOverlay() {
  if (overlayVisible || !document.body || !isTrackingEnabled()) return;
  overlayVisible = true;
  pauseVideo();

  browser.storage.local.get(['extensionIncrement']).then((result) => {
    const increment = result.extensionIncrement || 10;
    const overlay = document.createElement('div');
    overlay.id = 'reelscap-overlay';
    overlay.innerHTML = `
      <div id="reelscap-overlay-content">
        <h1 style="color: #ff0000; font-size: 2.5rem; margin-bottom: 10px;">LIMIT REACHED</h1>
        <p style="font-size: 1.2rem; margin-bottom: 5px;">You have watched <strong>${localCount}</strong> videos today.</p>
        <p style="font-size: 1rem; margin-bottom: 25px; opacity: 0.8;">Your current daily allowance is <strong>${localLimit}</strong>.</p>
        
        <div class="reelscap-buttons">
          <button id="reelscap-dismiss" class="stop-btn">Stop Scrolling (Exit)</button>
          <button id="reelscap-extend" class="extend-btn">Continue Scrolling (+${increment} Allowance)</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('reelscap-dismiss')?.addEventListener('click', () => {
      overlay.remove();
      overlayVisible = false;
      const host = window.location.host;
      if (host.includes('youtube.com')) window.location.href = 'https://www.youtube.com/';
      else if (host.includes('tiktok.com')) window.location.href = 'https://www.tiktok.com/explore';
      else if (host.includes('instagram.com')) window.location.href = 'https://www.instagram.com/';
      else if (host.includes('facebook.com')) window.location.href = 'https://www.facebook.com/';
    });

    document.getElementById('reelscap-extend')?.addEventListener('click', async () => {
      if (!isContextValid()) {
        alert("Extension updated. Please refresh the page.");
        return;
      }
      try {
        const response = await browser.runtime.sendMessage({ type: 'EXTEND_LIMIT' });
        if (response && response.success) {
          localLimit = response.newLimit;
          overlay.remove();
          overlayVisible = false;
          showToast(localCount, localLimit);
        }
      } catch (e) {
        console.error("ReelsCap: Failed to extend limit", e);
      }
    });
  });
}

function showToast(count, limit) {
  if (!document.body || !isTrackingEnabled()) return;
  let toast = document.getElementById('reelscap-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'reelscap-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = `Total Daily Videos: ${count} / ${limit}`;
  toast.className = 'reelscap-toast visible';
  setTimeout(() => toast?.classList.remove('visible'), 3000);
}

async function updateStatus() {
  if (!isContextValid()) return;
  try {
    const response = await browser.runtime.sendMessage({ type: 'GET_STATUS' });
    if (response) {
      localCount = response.count;
      localLimit = response.limit;
      localTracking = response.tracking || { youtube: true, instagram: true, tiktok: true, facebook: true };
      if (localCount > localLimit && isTrackingEnabled()) showOverlay();
    }
  } catch (e) {
    console.log("ReelsCap: Context invalidated. Refresh suggested.");
  }
}

async function handleVideoChange() {
  if (!isVideoPage() || !isContextValid() || !isTrackingEnabled()) return;
  
  const currentId = getUniqueVideoId();
  if (currentId && currentId !== lastVideoId) {
    lastVideoId = currentId;
    
    try {
      const response = await browser.runtime.sendMessage({ type: 'INCREMENT_COUNT' });
      if (response) {
        localCount = response.count;
        localLimit = response.limit;
        
        if (localCount > localLimit) {
          showOverlay();
        } else {
          showToast(localCount, localLimit);
        }
      }
    } catch (e) { }
  } else if (localCount > localLimit) {
    showOverlay();
  }
}

// Initialize
if (isContextValid()) {
  updateStatus().then(() => {
    const observer = new MutationObserver(() => {
      handleVideoChange();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    setInterval(handleVideoChange, 1000);
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'COUNT_UPDATED') {
      localCount = message.count;
      localLimit = message.limit;
      if (localCount > localLimit) showOverlay();
    }
  });
}
