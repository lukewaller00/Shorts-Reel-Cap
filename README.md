# ReelsCap - Social Video Limiter

ReelsCap is a browser extension designed to help you regain control over your time by limiting the number of short-form videos you watch daily on YouTube Shorts, Instagram Reels, and TikTok.

## 🚀 Features

- **Cross-Platform Tracking:** Automatically monitors and counts videos watched on:
  - YouTube Shorts
  - Instagram Reels
  - TikTok
- **Unified Daily Limit:** Set a single daily allowance that applies across all three platforms.
- **Visual Progress Dashboard:** A sleek popup interface with a circular progress bar to track your daily consumption.
- **Real-Time Toast Notifications:** Subtle in-page notifications keep you informed of your current count as you scroll.
- **Hard Stop Overlay:** When your limit is reached, a full-screen overlay blocks further scrolling, encouraging you to step away or intentionally extend your limit.
- **Customizable Tracking:** Toggle tracking on or off for specific platforms based on your needs.
- **Automatic Daily Reset:** Your watch count automatically resets every day, giving you a fresh start.

## 🛠️ Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** by toggling the switch in the top-right corner.
4. Click on **Load unpacked** and select the directory where you saved the ReelsCap files.
5. Pin the extension to your toolbar for easy access to your daily stats.

## 📖 How to Use

1. **Set Your Limit:** Click the ReelsCap icon in your browser toolbar and enter your desired daily video limit (e.g., 30 videos).
2. **Configure Platforms:** Use the toggles in the popup to choose which platforms you want to track.
3. **Scroll Mindfully:** As you watch Shorts, Reels, or TikToks, the extension will increment your count and show a brief toast notification.
4. **Limit Reached:** Once you exceed your limit, an overlay will appear. You can choose to:
   - **Stop Scrolling:** Redirects you away from the video feed.
   - **Continue Scrolling (+10 Allowance):** Adds 10 more videos to your limit for the day if you need a little more time.
5. **Reset:** You can manually reset your count at any time from the settings popup.

## 💻 Tech Stack

- **Manifest V3:** Built using the latest Chrome Extension standards.
- **JavaScript:** Handles monitoring, state management, and UI logic.
- **HTML/CSS:** Provides the styling for the popup dashboard and the enforcement overlay.
- **Chrome Storage API:** Persists your settings and daily counts locally.

## 🛡️ Privacy

ReelsCap respects your privacy. All data (counts, limits, and settings) is stored locally on your machine and is never transmitted to any external servers.

---

*Take back your time and scroll with intention!*
