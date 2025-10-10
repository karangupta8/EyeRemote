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
  chrome.storage.sync.set({ isEnabled: false, timeout: 3 });
  console.log("EyeRemote extension installed and initialized.");
});

// Listen for messages from other parts of the extension (e.g., popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleDetection") {
    const { isEnabled } = request.payload;
    console.log(`Detection state changed to: ${isEnabled}`);
    // Here you would add logic to start/stop the gaze detection process.
  }
});