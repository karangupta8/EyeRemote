# EyeRemote - Chrome Extension

This directory contains the complete EyeRemote Chrome Extension with gaze detection capabilities.

## Features

- **Gaze Detection**: Uses MediaPipe face landmark detection to determine when you're looking at the screen
- **Auto Pause/Resume**: Automatically pauses YouTube videos when you look away and resumes when you look back
- **Configurable Timeout**: Adjustable delay (1-10 seconds) before pausing when gaze is lost
- **Real-time Status**: Live status indicators for detection, camera, video, and gaze states
- **YouTube Integration**: Works with YouTube's player API and embedded videos
- **Per-tab Operation**: Each tab runs independently - use the extension on different tabs as needed

## Project Structure

```
eyeremote-chromeext/
├── lib/                           # MediaPipe assets (offline use)
│   ├── wasm/                      # WASM files for MediaPipe
│   │   ├── vision_wasm_internal.js
│   │   └── vision_wasm_internal.wasm
│   ├── vision_tasks.js            # MediaPipe vision tasks
│   └── face_landmarker.task       # Face detection model
├── icons/                         # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json                  # Extension manifest (Manifest V3)
├── popup.html                     # Modern popup UI
├── popup.js                       # Popup logic and status management
├── background.js                  # Background service worker
├── content.js                     # Content script for YouTube integration
├── gazeDetector.js               # Gaze detection module
├── download_mediapipe.ps1        # Script to download MediaPipe assets
└── README.md                     # This file
```

## Setup Instructions

### 1. Download MediaPipe Assets

**Important**: The placeholder MediaPipe files need to be replaced with actual files for the extension to work.

Run the PowerShell script to download the required MediaPipe assets:

```powershell
cd eyeremote-chromeext
.\download_mediapipe.ps1
```

This will download:
- `lib/vision_tasks.js` - MediaPipe vision tasks library
- `lib/wasm/vision_wasm_internal.js` - WASM JavaScript wrapper
- `lib/wasm/vision_wasm_internal.wasm` - WASM binary
- `lib/face_landmarker.task` - Face detection model

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" button
4. Select the `eyeremote-chromeext` folder
5. The EyeRemote extension icon should appear in your toolbar

### 3. Grant Permissions

When you first enable detection, Chrome will ask for:
- **Camera permission**: Required for gaze detection
- **YouTube access**: Already configured in manifest

## Usage

1. **Navigate to YouTube**: Go to any YouTube video page
2. **Open Extension**: Click the EyeRemote icon in your toolbar
3. **Enable Detection**: Toggle the "Enable Detection" switch
4. **Adjust Settings**: Use the timeout slider (1-10 seconds)
5. **Watch Videos**: Look away to pause, look back to resume

## Technical Details

### Architecture

- **Hybrid Approach**: Background script manages state, content scripts handle per-tab detection
- **Per-tab Camera**: Each tab gets its own camera instance when detection is enabled
- **MediaPipe Integration**: Bundled offline for privacy and performance
- **YouTube API**: Uses YouTube player API when available, falls back to direct video control

### Detection Logic

- **Face Presence**: Simplified gaze detection based on face landmark detection
- **Timeout System**: Configurable delay before auto-pause when gaze is lost
- **State Management**: Tracks user vs. extension-initiated play/pause to avoid conflicts

### Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Edge**: Should work (Chromium-based)
- **Firefox**: Not supported (different extension system)

## Privacy & Security

- **Offline Processing**: MediaPipe runs locally, no data sent to external servers
- **Camera Access**: Only used for face detection, no video recording or storage
- **Local Storage**: Settings stored locally in Chrome's sync storage
- **YouTube Only**: Limited to YouTube pages for security

## Troubleshooting

### Camera Permission Issues
- Make sure to allow camera access when prompted
- Check Chrome's site permissions for YouTube
- Verify no other applications are using the camera

### Detection Not Working
- Ensure you're on a YouTube page
- Check that MediaPipe assets are properly downloaded
- Verify the extension popup shows "Camera: Working"

### Video Control Issues
- Refresh the YouTube page and try again
- Check if the video is in an ad state (ads are not controlled)
- Ensure you're not manually pausing/playing during detection

### Performance Issues
- Close other tabs using the extension
- Reduce timeout duration
- Check Chrome's task manager for high CPU usage

## Development

### File Descriptions

- **`manifest.json`**: Extension configuration, permissions, and entry points
- **`popup.html/js`**: Modern UI with status indicators and controls
- **`background.js`**: State management and cross-component communication
- **`content.js`**: YouTube integration, video control, and gaze detection coordination
- **`gazeDetector.js`**: MediaPipe integration and camera management

### Key Features Implemented

✅ **Phase 1 - Core Gaze Detection**
- MediaPipe face landmark detection
- Camera access and video processing
- Face presence detection (simplified gaze)

✅ **Phase 2 - Enhanced Media Control**
- YouTube video player detection
- Sophisticated play/pause control with API fallback
- Timeout tracking and state management

✅ **Phase 3 - Simple Popup UI**
- Modern gradient design with status indicators
- Toggle switch for detection enable/disable
- Timeout slider (1-10 seconds)
- Real-time status updates

## License

This extension is part of the EyeRemote project. See the main project README for license information.