/**
 * EyeRemote - Content Script
 *
 * This script is injected into web pages (like YouTube) to control media playback.
 * It can interact with the DOM of the web page and handle gaze detection.
 */

console.log("EyeRemote content script loaded.");

// Global state
let gazeDetector = null;
let isDetectionEnabled = false;
let timeoutSeconds = 3;
let lastGazeDetected = null;
let pauseTimer = null;
let wasPausedByExtension = false;
let currentVideo = null;
let lastVideoState = null;

// Initialize the content script
init();

/**
 * Initialize the content script
 */
async function init() {
  // Load settings
  await loadSettings();
  
  // Set up video monitoring
  setupVideoMonitoring();
  
  // Listen for messages
  setupMessageListeners();
  
  console.log("EyeRemote content script initialized");
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['isEnabled', 'timeout']);
    isDetectionEnabled = result.isEnabled || false;
    timeoutSeconds = result.timeout || 3;
    console.log('Settings loaded:', { isDetectionEnabled, timeoutSeconds });
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Set up video element monitoring
 */
function setupVideoMonitoring() {
  // Monitor for video elements (YouTube SPA navigation)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const videos = document.querySelectorAll('video');
        if (videos.length > 0 && videos[0] !== currentVideo) {
          currentVideo = videos[0];
          setupVideoEventListeners();
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial video detection
  currentVideo = document.querySelector('video');
  if (currentVideo) {
    setupVideoEventListeners();
  }
}

/**
 * Set up video event listeners
 */
function setupVideoEventListeners() {
  if (!currentVideo) return;

  // Listen for user-initiated play/pause to avoid conflicts
  currentVideo.addEventListener('play', () => {
    if (!wasPausedByExtension) {
      console.log('User started playing video');
      clearPauseTimer();
    } else {
      console.log('Extension resumed video');
      wasPausedByExtension = false;
    }
  });

  currentVideo.addEventListener('pause', () => {
    if (!wasPausedByExtension) {
      console.log('User paused video');
      clearPauseTimer();
    } else {
      console.log('Extension paused video');
    }
  });

  // Listen for video state changes
  currentVideo.addEventListener('loadstart', () => {
    console.log('Video loading started');
    clearPauseTimer();
  });

  currentVideo.addEventListener('canplay', () => {
    console.log('Video can start playing');
  });
}

/**
 * Set up message listeners
 */
function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);

    switch (request.action) {
      case "toggleDetection":
        handleToggleDetection(request, sendResponse);
        break;
        
      case "getStatus":
        handleGetStatus(sendResponse);
        break;
        
      case "updateSettings":
        handleUpdateSettings(request, sendResponse);
        break;
        
      default:
        console.log('Unknown action:', request.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }

    return true; // Keep message channel open for async responses
  });
}

/**
 * Handle detection toggle
 */
async function handleToggleDetection(request, sendResponse) {
  try {
    const { isEnabled } = request.payload;
    isDetectionEnabled = isEnabled;
    
    if (isEnabled) {
      await startGazeDetection();
    } else {
      stopGazeDetection();
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error toggling detection:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle status request
 */
function handleGetStatus(sendResponse) {
  const status = {
    isDetectionEnabled,
    isGazeDetected: lastGazeDetected !== null,
    hasVideo: !!currentVideo,
    isVideoPlaying: currentVideo ? !currentVideo.paused : false,
    isDetectorReady: gazeDetector ? gazeDetector.isReady() : false,
    cameraWorking: gazeDetector ? gazeDetector.isCameraWorking() : false,
    timeoutSeconds
  };
  
  sendResponse({ success: true, status });
}

/**
 * Handle settings update
 */
async function handleUpdateSettings(request, sendResponse) {
  try {
    const { settings } = request.payload;
    if (settings.timeout !== undefined) {
      timeoutSeconds = settings.timeout;
    }
    if (settings.isEnabled !== undefined) {
      isDetectionEnabled = settings.isEnabled;
      if (isDetectionEnabled) {
        await startGazeDetection();
      } else {
        stopGazeDetection();
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Start gaze detection
 */
async function startGazeDetection() {
  if (gazeDetector) {
    console.log('Gaze detector already running');
    return;
  }

  try {
    // Load the gaze detector script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('gazeDetector.js');
    document.head.appendChild(script);

    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });

    // Initialize gaze detector
    gazeDetector = new GazeDetector();
    
    await gazeDetector.initialize(
      onGazeChange,
      onDetectionError,
      onDetectionInitialized,
      true
    );

    console.log('Gaze detection started');
  } catch (error) {
    console.error('Failed to start gaze detection:', error);
    sendStatusUpdate({ error: error.message });
  }
}

/**
 * Stop gaze detection
 */
function stopGazeDetection() {
  if (gazeDetector) {
    gazeDetector.stop();
    gazeDetector = null;
  }
  
  clearPauseTimer();
  lastGazeDetected = null;
  wasPausedByExtension = false;
  
  console.log('Gaze detection stopped');
}

/**
 * Handle gaze state changes
 */
function onGazeChange(isWatching) {
  const now = Date.now();
  lastGazeDetected = isWatching ? now : null;
  
  console.log('Gaze state changed:', isWatching ? 'watching' : 'not watching');
  
  if (isWatching) {
    // Clear any pending pause timer
    clearPauseTimer();
    
    // Resume video if it was paused by extension
    if (wasPausedByExtension && currentVideo && currentVideo.paused) {
      resumeVideo();
    }
  } else {
    // Start pause timer
    startPauseTimer();
  }
  
  sendStatusUpdate();
}

/**
 * Handle detection errors
 */
function onDetectionError(error) {
  console.error('Detection error:', error);
  sendStatusUpdate({ error });
}

/**
 * Handle detection initialization
 */
function onDetectionInitialized(initialized) {
  console.log('Detection initialized:', initialized);
  sendStatusUpdate();
}

/**
 * Start pause timer
 */
function startPauseTimer() {
  clearPauseTimer();
  
  pauseTimer = setTimeout(() => {
    if (!lastGazeDetected && currentVideo && !currentVideo.paused) {
      pauseVideo();
    }
  }, timeoutSeconds * 1000);
  
  console.log(`Pause timer started: ${timeoutSeconds}s`);
}

/**
 * Clear pause timer
 */
function clearPauseTimer() {
  if (pauseTimer) {
    clearTimeout(pauseTimer);
    pauseTimer = null;
    console.log('Pause timer cleared');
  }
}

/**
 * Detect platform and get appropriate player controls
 */
function getPlatformControls() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('youtube.com')) {
    return {
      name: 'YouTube',
      pause: () => {
        if (window.yt && window.yt.player && window.yt.player.getPlayerByElement) {
          const player = window.yt.player.getPlayerByElement(currentVideo);
          if (player && player.pauseVideo) {
            player.pauseVideo();
            return true;
          }
        }
        return false;
      },
      play: () => {
        if (window.yt && window.yt.player && window.yt.player.getPlayerByElement) {
          const player = window.yt.player.getPlayerByElement(currentVideo);
          if (player && player.playVideo) {
            player.playVideo();
            return true;
          }
        }
        return false;
      }
    };
  }
  
  if (hostname.includes('netflix.com')) {
    return {
      name: 'Netflix',
      pause: () => {
        // Netflix uses keyboard shortcuts
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32, code: 'Space' }));
        return true;
      },
      play: () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32, code: 'Space' }));
        return true;
      }
    };
  }
  
  if (hostname.includes('disneyplus.com') || hostname.includes('hulu.com') || 
      hostname.includes('primevideo.com') || hostname.includes('max.com') || 
      hostname.includes('peacocktv.com')) {
    return {
      name: hostname.includes('disneyplus.com') ? 'Disney+' : 
            hostname.includes('hulu.com') ? 'Hulu' :
            hostname.includes('primevideo.com') ? 'Prime Video' :
            hostname.includes('max.com') ? 'Max' : 'Peacock',
      pause: () => {
        // Try keyboard shortcut first
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32, code: 'Space' }));
        return true;
      },
      play: () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32, code: 'Space' }));
        return true;
      }
    };
  }
  
  return null;
}

/**
 * Pause video
 */
function pauseVideo() {
  if (!currentVideo || currentVideo.paused) return;
  
  try {
    const controls = getPlatformControls();
    
    if (controls) {
      // Try platform-specific control first
      if (controls.pause()) {
        console.log(`Video paused via ${controls.name} control`);
        wasPausedByExtension = true;
        sendStatusUpdate();
        return;
      }
    }
    
    // Fallback to direct control
    currentVideo.pause();
    console.log('Video paused via direct control');
    wasPausedByExtension = true;
    sendStatusUpdate();
  } catch (error) {
    console.error('Error pausing video:', error);
  }
}

/**
 * Resume video
 */
function resumeVideo() {
  if (!currentVideo || !currentVideo.paused) return;
  
  try {
    const controls = getPlatformControls();
    
    if (controls) {
      // Try platform-specific control first
      if (controls.play()) {
        console.log(`Video resumed via ${controls.name} control`);
        wasPausedByExtension = false;
        sendStatusUpdate();
        return;
      }
    }
    
    // Fallback to direct control
    currentVideo.play();
    console.log('Video resumed via direct control');
    wasPausedByExtension = false;
    sendStatusUpdate();
  } catch (error) {
    console.error('Error resuming video:', error);
  }
}

/**
 * Send status update to background script
 */
function sendStatusUpdate(additionalStatus = {}) {
  const status = {
    isDetectionEnabled,
    isGazeDetected: lastGazeDetected !== null,
    hasVideo: !!currentVideo,
    isVideoPlaying: currentVideo ? !currentVideo.paused : false,
    isDetectorReady: gazeDetector ? gazeDetector.isReady() : false,
    cameraWorking: gazeDetector ? gazeDetector.isCameraWorking() : false,
    timeoutSeconds,
    ...additionalStatus
  };
  
  chrome.runtime.sendMessage({
    action: "statusUpdate",
    status
  });
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page hidden, stopping detection');
    if (gazeDetector) {
      gazeDetector.stop();
    }
    clearPauseTimer();
  } else if (isDetectionEnabled && gazeDetector) {
    console.log('Page visible, resuming detection');
    gazeDetector.start();
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (gazeDetector) {
    gazeDetector.cleanup();
  }
  clearPauseTimer();
});