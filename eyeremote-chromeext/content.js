/**
 * EyeRemote - Content Script
 *
 * This script is injected into web pages (like YouTube) to control media playback.
 * It can interact with the DOM of the web page.
 */

console.log("EyeRemote content script loaded.");

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "pauseMedia") {
    console.log("Received request to pause media.");
    const video = document.querySelector('video');
    if (video) video.pause();
  }

  if (request.action === "resumeMedia") {
    console.log("Received request to resume media.");
    const video = document.querySelector('video');
    if (video) video.play();
  }
});