/**
 * EyeRemote - Chrome Extension's background service worker.
 *
 * This script runs in the background to manage the extension's state
 * and handle events.
 */

console.log("EyeRemote background script loaded.");

// Initialize state when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default state
  chrome.storage.sync.set({ 
    isEnabled: false, 
    timeout: 3,
    detectionEnabled: false,
    lastTabId: null
  });
  console.log("EyeRemote extension installed and initialized.");
});

// Track active tab changes
let activeTabId = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
  chrome.storage.sync.set({ lastTabId: activeTabId });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    activeTabId = tabId;
    chrome.storage.sync.set({ lastTabId: activeTabId });
  }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.action) {
    case "toggleDetection":
      handleToggleDetection(request, sender, sendResponse);
      break;
      
    case "getSettings":
      handleGetSettings(sendResponse);
      break;
      
    case "updateSettings":
      handleUpdateSettings(request, sendResponse);
      break;
      
    case "getTabStatus":
      handleGetTabStatus(sender, sendResponse);
      break;
      
    case "statusUpdate":
      handleStatusUpdate(request, sender);
      break;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async responses
});

/**
 * Handle detection toggle from popup
 */
async function handleToggleDetection(request, sender, sendResponse) {
  try {
    const { isEnabled } = request.payload;
    
    // Update storage
    await chrome.storage.sync.set({ 
      isEnabled: isEnabled,
      detectionEnabled: isEnabled 
    });
    
    console.log(`Detection state changed to: ${isEnabled}`);
    
    // Send message to content script in active tab
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, {
          action: "toggleDetection",
          payload: { isEnabled: isEnabled }
        });
      } catch (error) {
        console.log('Could not send message to tab:', error);
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error toggling detection:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle settings request from popup
 */
async function handleGetSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get(['isEnabled', 'timeout', 'detectionEnabled']);
    sendResponse({ success: true, settings: settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle settings update from popup
 */
async function handleUpdateSettings(request, sendResponse) {
  try {
    const { settings } = request.payload;
    await chrome.storage.sync.set(settings);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle tab status request from popup
 */
async function handleGetTabStatus(sender, sendResponse) {
  try {
    if (sender.tab && sender.tab.id) {
      // Request status from the content script
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "getStatus"
      }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: 'No content script response' });
        } else {
          sendResponse({ success: true, status: response });
        }
      });
    } else {
      sendResponse({ success: false, error: 'No active tab' });
    }
  } catch (error) {
    console.error('Error getting tab status:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle status updates from content scripts
 */
function handleStatusUpdate(request, sender) {
  // Store status updates for popup queries
  if (sender.tab && sender.tab.id) {
    chrome.storage.local.set({
      [`tabStatus_${sender.tab.id}`]: request.status
    });
  }
}

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  // Clean up tab-specific data
  chrome.storage.local.remove([`tabStatus_${tabId}`]);
  
  if (tabId === activeTabId) {
    activeTabId = null;
    chrome.storage.sync.set({ lastTabId: null });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("EyeRemote extension started up.");
});