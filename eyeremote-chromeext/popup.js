/**
 * EyeRemote - Popup Script
 *
 * This script handles the logic for the extension's popup UI.
 */

// Global state
let currentSettings = {
  isEnabled: false,
  timeout: 3
};

let currentStatus = {
  isDetectionEnabled: false,
  isGazeDetected: false,
  hasVideo: false,
  isVideoPlaying: false,
  isDetectorReady: false,
  cameraWorking: false,
  timeoutSeconds: 3
};

// DOM elements
let toggleSwitch, timeoutSlider, timeoutValue, refreshBtn;
let detectionStatus, detectionIndicator, cameraStatus, cameraIndicator;
let videoStatus, videoIndicator, gazeStatus, gazeIndicator;
let errorContainer, errorMessage;

document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  setupEventListeners();
  loadSettings();
  updateStatus();
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
  toggleSwitch = document.getElementById('toggleSwitch');
  timeoutSlider = document.getElementById('timeoutSlider');
  timeoutValue = document.getElementById('timeoutValue');
  refreshBtn = document.getElementById('refreshBtn');
  
  detectionStatus = document.getElementById('detectionStatus');
  detectionIndicator = document.getElementById('detectionIndicator');
  cameraStatus = document.getElementById('cameraStatus');
  cameraIndicator = document.getElementById('cameraIndicator');
  videoStatus = document.getElementById('videoStatus');
  videoIndicator = document.getElementById('videoIndicator');
  gazeStatus = document.getElementById('gazeStatus');
  gazeIndicator = document.getElementById('gazeIndicator');
  
  errorContainer = document.getElementById('errorContainer');
  errorMessage = document.getElementById('errorMessage');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Toggle switch
  toggleSwitch.addEventListener('click', toggleDetection);
  
  // Timeout slider
  timeoutSlider.addEventListener('input', updateTimeout);
  
  // Refresh button
  refreshBtn.addEventListener('click', refreshStatus);
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const response = await sendMessage({
      action: 'getSettings'
    });
    
    if (response.success) {
      currentSettings = response.settings;
      updateUI();
    } else {
      showError('Failed to load settings');
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showError('Error loading settings');
  }
}

/**
 * Update UI based on current settings
 */
function updateUI() {
  // Update toggle switch
  if (currentSettings.isEnabled) {
    toggleSwitch.classList.add('active');
  } else {
    toggleSwitch.classList.remove('active');
  }
  
  // Update timeout slider
  timeoutSlider.value = currentSettings.timeout || 3;
  timeoutValue.textContent = `${currentSettings.timeout || 3}s`;
}

/**
 * Toggle detection on/off
 */
async function toggleDetection() {
  try {
    const newState = !currentSettings.isEnabled;
    
    // Show loading state
    setLoadingState(true);
    
    const response = await sendMessage({
      action: 'toggleDetection',
      payload: { isEnabled: newState }
    });
    
    if (response.success) {
      currentSettings.isEnabled = newState;
      updateUI();
      hideError();
      
      // Refresh status after a short delay
      setTimeout(() => {
        refreshStatus();
      }, 1000);
    } else {
      showError(response.error || 'Failed to toggle detection');
    }
  } catch (error) {
    console.error('Error toggling detection:', error);
    showError('Error toggling detection');
  } finally {
    setLoadingState(false);
  }
}

/**
 * Update timeout setting
 */
async function updateTimeout() {
  try {
    const newTimeout = parseInt(timeoutSlider.value);
    timeoutValue.textContent = `${newTimeout}s`;
    
    const response = await sendMessage({
      action: 'updateSettings',
      payload: { settings: { timeout: newTimeout } }
    });
    
    if (response.success) {
      currentSettings.timeout = newTimeout;
    } else {
      showError(response.error || 'Failed to update timeout');
    }
  } catch (error) {
    console.error('Error updating timeout:', error);
    showError('Error updating timeout');
  }
}

/**
 * Refresh status from content script
 */
async function refreshStatus() {
  try {
    setLoadingState(true);
    
    const response = await sendMessage({
      action: 'getTabStatus'
    });
    
    if (response.success && response.status) {
      currentStatus = response.status;
      updateStatusDisplay();
      hideError();
    } else {
      showError('No response from content script. Make sure you are on a YouTube page.');
    }
  } catch (error) {
    console.error('Error refreshing status:', error);
    showError('Error refreshing status');
  } finally {
    setLoadingState(false);
  }
}

/**
 * Update status display
 */
function updateStatusDisplay() {
  // Detection status
  if (currentStatus.isDetectionEnabled) {
    detectionStatus.textContent = 'Active';
    detectionIndicator.className = 'status-indicator online';
  } else {
    detectionStatus.textContent = 'Inactive';
    detectionIndicator.className = 'status-indicator offline';
  }
  
  // Camera status
  if (currentStatus.cameraWorking) {
    cameraStatus.textContent = 'Working';
    cameraIndicator.className = 'status-indicator online';
  } else if (currentStatus.isDetectorReady) {
    cameraStatus.textContent = 'Ready';
    cameraIndicator.className = 'status-indicator offline';
  } else {
    cameraStatus.textContent = 'Not Ready';
    cameraIndicator.className = 'status-indicator offline';
  }
  
  // Video status
  if (currentStatus.hasVideo) {
    if (currentStatus.isVideoPlaying) {
      videoStatus.textContent = 'Playing';
      videoIndicator.className = 'status-indicator online';
    } else {
      videoStatus.textContent = 'Paused';
      videoIndicator.className = 'status-indicator offline';
    }
  } else {
    videoStatus.textContent = 'No Video';
    videoIndicator.className = 'status-indicator offline';
  }
  
  // Gaze status
  if (currentStatus.isGazeDetected) {
    gazeStatus.textContent = 'Detected';
    gazeIndicator.className = 'status-indicator online';
  } else {
    gazeStatus.textContent = 'Not Detected';
    gazeIndicator.className = 'status-indicator offline';
  }
}

/**
 * Update status (called periodically)
 */
function updateStatus() {
  refreshStatus();
  
  // Update status every 2 seconds when popup is open
  setTimeout(updateStatus, 2000);
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
  if (loading) {
    document.body.classList.add('loading');
  } else {
    document.body.classList.remove('loading');
  }
}

/**
 * Show error message
 */
function showError(message) {
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
  errorContainer.style.display = 'none';
}

/**
 * Send message to background script
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Handle popup visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Popup became visible, refresh status
    refreshStatus();
  }
});

// Handle popup focus
window.addEventListener('focus', () => {
  refreshStatus();
});