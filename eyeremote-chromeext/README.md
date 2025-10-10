# EyeRemote - Chrome Extension

This directory contains the source code for the EyeRemote Chrome Extension.

## Project Structure

```
eyeremote-chromeext/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json         # Extension manifest (permissions, settings)
├── popup.html            # UI for the extension popup
├── popup.js              # Logic for the popup UI
├── background.js         # Background service worker for state management
└── content.js            # Injected into web pages to control media
```

### File Descriptions

- **`manifest.json`**: The core configuration file for the extension. It defines the name, version, permissions, and entry points for other scripts. We are using Manifest V3.

- **`popup.html` / `popup.js`**: These files create the small window that appears when you click the extension icon in the Chrome toolbar. This is where the user will enable/disable gaze detection and configure settings.

- **`background.js`**: This is the extension's service worker. It runs in the background and manages the overall state, such as whether detection is active. It can communicate with both the popup and content scripts.

- **`content.js`**: A script that gets injected directly into specified web pages (e.g., `youtube.com`). It has access to the page's DOM and can directly control video players (e.g., by calling `.play()` or `.pause()` on a `<video>` element).

- **`icons/`**: Contains the extension's icons for the toolbar, extension management page, etc.

## How to Load the Extension for Development

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" using the toggle in the top-right corner.
3.  Click the "Load unpacked" button.
4.  Select the `chrome-extension` folder from this project.
5.  The EyeRemote extension icon should appear in your toolbar.