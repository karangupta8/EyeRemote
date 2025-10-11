/**
 * EyeRemote - Gaze Detection Module
 * 
 * This module handles camera access and face detection using MediaPipe
 * Ported from the React GazeDetector component
 */

class GazeDetector {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.faceLandmarker = null;
    this.animationFrameId = null;
    this.isInitialized = false;
    this.lastDetectionState = null;
    this.stream = null;
    this.onGazeChange = null;
    this.onError = null;
    this.onInitialized = null;
    this.isEnabled = false;
  }

  /**
   * Initialize the gaze detector
   * @param {Function} onGazeChange - Callback when gaze state changes
   * @param {Function} onError - Callback for errors
   * @param {Function} onInitialized - Callback when initialized
   * @param {boolean} isEnabled - Whether detection is enabled
   */
  async initialize(onGazeChange, onError, onInitialized, isEnabled) {
    this.onGazeChange = onGazeChange;
    this.onError = onError;
    this.onInitialized = onInitialized;
    this.isEnabled = isEnabled;

    try {
      await this.initializeFaceLandmarker();
      if (isEnabled) {
        await this.startWebcam();
      }
    } catch (error) {
      console.error('Failed to initialize gaze detector:', error);
      if (this.onError) {
        this.onError('initialization-failed');
      }
    }
  }

  /**
   * Initialize MediaPipe FaceLandmarker
   */
  async initializeFaceLandmarker() {
    try {
      // Load MediaPipe from bundled files
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('lib/tasks-vision.js');
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Wait for MediaPipe to be available
      let retries = 0;
      while (!window.mediapipe && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.mediapipe) {
        throw new Error('MediaPipe failed to load');
      }

      const { FaceLandmarker, FilesetResolver } = window.mediapipe.tasks.vision;

      // Initialize FilesetResolver with bundled WASM files
      const vision = await FilesetResolver.forVisionTasks(
        chrome.runtime.getURL('lib/wasm')
      );

      // Create FaceLandmarker with bundled model
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: chrome.runtime.getURL('lib/face_landmarker.task'),
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1
      });

      this.isInitialized = true;
      if (this.onError) {
        this.onError(null);
      }
      console.log('Gaze detector initialized successfully');

    } catch (error) {
      console.error('Failed to initialize face landmarker:', error);
      throw error;
    }
  }

  /**
   * Start webcam stream
   */
  async startWebcam() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      // Create video element for processing
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.width = 640;
      this.video.height = 480;
      this.video.autoplay = true;
      this.video.playsInline = true;
      this.video.muted = true;
      this.video.style.display = 'none'; // Hidden video element
      document.body.appendChild(this.video);

      this.video.addEventListener('loadeddata', () => {
        this.predictWebcam();
      });

      if (this.onError) {
        this.onError(null);
      }
      if (this.onInitialized) {
        this.onInitialized(true);
      }

    } catch (error) {
      console.error('Failed to access webcam:', error);
      if (this.onError) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.onError('permission-denied');
        } else if (error.name === 'NotFoundError') {
          this.onError('no-camera');
        } else {
          this.onError('camera-error');
        }
      }
    }
  }

  /**
   * Main detection loop
   */
  predictWebcam() {
    if (!this.faceLandmarker || !this.video || !this.isEnabled) {
      return;
    }

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      const results = this.faceLandmarker.detectForVideo(this.video, performance.now());
      
      // Detect if face is present (simplified gaze detection)
      const isFaceDetected = results.faceLandmarks && results.faceLandmarks.length > 0;
      
      // Only trigger callback if state changed
      if (this.lastDetectionState !== isFaceDetected) {
        this.lastDetectionState = isFaceDetected;
        if (this.onGazeChange) {
          this.onGazeChange(isFaceDetected);
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.predictWebcam());
  }

  /**
   * Start detection
   */
  async start() {
    if (!this.isInitialized) {
      await this.initializeFaceLandmarker();
    }
    
    this.isEnabled = true;
    
    if (!this.stream) {
      await this.startWebcam();
    } else {
      this.predictWebcam();
    }
  }

  /**
   * Stop detection
   */
  stop() {
    this.isEnabled = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.video && this.video.parentNode) {
      this.video.parentNode.removeChild(this.video);
      this.video = null;
    }

    if (this.onInitialized) {
      this.onInitialized(false);
    }

    this.lastDetectionState = null;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stop();
    this.faceLandmarker = null;
    this.isInitialized = false;
  }

  /**
   * Check if detector is ready
   */
  isReady() {
    return this.isInitialized && this.faceLandmarker !== null;
  }

  /**
   * Check if camera is working
   */
  isCameraWorking() {
    return this.stream && this.stream.active && 
           this.stream.getVideoTracks().some(track => track.readyState === 'live');
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GazeDetector;
} else {
  window.GazeDetector = GazeDetector;
}
