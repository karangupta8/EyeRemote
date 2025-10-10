/**
 * EyeRemote - Popup Script
 *
 * This script handles the logic for the extension's popup UI.
 */

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');

  // Load the current state from storage and update the button
  chrome.storage.sync.get('isEnabled', ({ isEnabled }) => {
    toggleBtn.textContent = isEnabled ? 'Disable Gaze Detection' : 'Enable Gaze Detection';
  });

  // Handle button click
  toggleBtn.addEventListener('click', () => {
    chrome.storage.sync.get('isEnabled', ({ isEnabled }) => {
      const newIsEnabledState = !isEnabled;
      chrome.storage.sync.set({ isEnabled: newIsEnabledState });
      toggleBtn.textContent = newIsEnabledState ? 'Disable Gaze Detection' : 'Enable Gaze Detection';

      // Send a message to the background script about the state change
      chrome.runtime.sendMessage({
        action: 'toggleDetection',
        payload: { isEnabled: newIsEnabledState }
      });
    });
  });
});