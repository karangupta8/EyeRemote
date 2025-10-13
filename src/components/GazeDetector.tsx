import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { toast } from "sonner";

interface GazeDetectorProps {
  onGazeChange: (isWatching: boolean) => void;
  onError: (error: string | null) => void;
  onInitialized: (initialized: boolean) => void;
  isEnabled: boolean;
  showPreview?: boolean;
}

export function GazeDetector({ onGazeChange, onError, onInitialized, isEnabled, showPreview = false }: GazeDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State smoothing logic with refs for immediate updates (matching desktop app implementation)
  const eyesPresentCounterRef = useRef(0);
  const noEyesCounterRef = useRef(0);
  const eyesDetectedStableStateRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const [fps, setFps] = useState(0);
  
  // Constants for state smoothing (matching desktop app)
  const EYES_PRESENT_THRESHOLD = 3;  // Frames to confirm eyes are present (increased for stability)
  const NO_EYES_THRESHOLD = 4;       // Frames to confirm eyes are gone (increased for stability)
  const PROCESS_INTERVAL = 100;      // 100ms = ~10 FPS (matching desktop app's 0.1s delay)

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU" // Use GPU for better performance
          },
          runningMode: "VIDEO",
          numFaces: 1
        });

        faceLandmarkerRef.current = faceLandmarker;
        setIsInitialized(true);
        onError(null);
      } catch (error) {
        console.error("Failed to initialize face landmarker:", error);
        onError("initialization-failed");
        toast.error("Failed to initialize gaze detection");
      }
    };

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
        onError(null);
        onInitialized(true);
      } catch (error: any) {
        console.error("Failed to access webcam:", error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          onError("permission-denied");
          toast.error("Camera permission denied. Please allow camera access.");
        } else if (error.name === 'NotFoundError') {
          onError("no-camera");
          toast.error("No camera found. Please connect a camera.");
        } else {
          onError("camera-error");
          toast.error("Failed to access webcam");
        }
      }
    };

    const predictWebcam = () => {
      if (!faceLandmarkerRef.current || !videoRef.current) return;

      // If detection is off but preview is on, we still need to draw to the canvas.
      // But we should stop the animation frame if neither is enabled.
      if (!isEnabled && !showPreview) {
        return; 
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Frame rate control - only process every PROCESS_INTERVAL ms (matching desktop app)
      const now = performance.now();
      if (now - lastProcessTimeRef.current < PROCESS_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(predictWebcam);
        return;
      }
      lastProcessTimeRef.current = now;

      // FPS calculation for debugging
      frameCountRef.current++;
      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(Math.round(frameCountRef.current * 1000 / (now - lastFpsTimeRef.current)));
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
        
        // Draw on canvas if preview is enabled
        if (canvas && showPreview) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              const landmarks = results.faceLandmarks[0];
              
              // Draw all landmarks
              ctx.fillStyle = 'rgba(124, 58, 237, 0.5)';
              landmarks.forEach((landmark) => {
                ctx.fillRect(
                  landmark.x * canvas.width - 2,
                  landmark.y * canvas.height - 2,
                  4,
                  4
                );
              });

              // Highlight eye landmarks specifically
              const leftEyeLandmarks = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
              const rightEyeLandmarks = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
              
              ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'; // Green for eye landmarks
              [...leftEyeLandmarks, ...rightEyeLandmarks].forEach((index) => {
                if (landmarks[index]) {
                  ctx.fillRect(
                    landmarks[index].x * canvas.width - 3,
                    landmarks[index].y * canvas.height - 3,
                    6,
                    6
                  );
                }
              });
            }
          }
        }
        
        // Enhanced eye detection with state smoothing (matching desktop app logic)
        if (isEnabled) {
          let isEyesDetected = false;
          
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            
            // Check for specific eye landmarks (MediaPipe provides 468 face landmarks)
            const leftEyeLandmarks = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
            const rightEyeLandmarks = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
            
            // Count valid landmarks for each eye (more robust detection)
            const leftEyeValidCount = leftEyeLandmarks.filter(index => 
              landmarks[index] && landmarks[index].x > 0 && landmarks[index].y > 0 && 
              landmarks[index].x < 1 && landmarks[index].y < 1
            ).length;
            
            const rightEyeValidCount = rightEyeLandmarks.filter(index => 
              landmarks[index] && landmarks[index].x > 0 && landmarks[index].y > 0 && 
              landmarks[index].x < 1 && landmarks[index].y < 1
            ).length;
            
            // Consider eyes detected if we have at least 50% of landmarks for each eye
            const hasLeftEye = leftEyeValidCount >= leftEyeLandmarks.length * 0.5;
            const hasRightEye = rightEyeValidCount >= rightEyeLandmarks.length * 0.5;
            
            isEyesDetected = hasLeftEye && hasRightEye;
          }
          
          // State smoothing logic using refs for immediate updates (matching desktop app implementation)
          if (isEyesDetected) {
            noEyesCounterRef.current = 0;
            eyesPresentCounterRef.current += 1;
            
            console.log(`[GazeDetector] Eyes detected - Counter: ${eyesPresentCounterRef.current}/${EYES_PRESENT_THRESHOLD}, State: ${eyesDetectedStableStateRef.current}`);
            
            if (eyesPresentCounterRef.current >= EYES_PRESENT_THRESHOLD && !eyesDetectedStableStateRef.current) {
              eyesDetectedStableStateRef.current = true;
              console.log('[GazeDetector] State changed to WATCHING');
              onGazeChange(true);
            }
          } else {
            eyesPresentCounterRef.current = 0;
            noEyesCounterRef.current += 1;
            
            console.log(`[GazeDetector] No eyes - Counter: ${noEyesCounterRef.current}/${NO_EYES_THRESHOLD}, State: ${eyesDetectedStableStateRef.current}`);
            
            if (noEyesCounterRef.current >= NO_EYES_THRESHOLD && eyesDetectedStableStateRef.current) {
              eyesDetectedStableStateRef.current = false;
              console.log('[GazeDetector] State changed to LOOKING AWAY');
              onGazeChange(false);
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(predictWebcam);
    };

    // Only start webcam if detection is enabled. Preview is an add-on.
    if (isEnabled) {
      initializeFaceLandmarker();
      startWebcam();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onInitialized(false);
      
      // Reset state smoothing counters
      eyesPresentCounterRef.current = 0;
      noEyesCounterRef.current = 0;
      eyesDetectedStableStateRef.current = false;
      setFps(0);
    };
    // Refs are excluded from dependencies as they don't trigger re-renders
  }, [isEnabled, onGazeChange, onError, onInitialized, showPreview]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={showPreview ? "flex justify-center" : "fixed -top-full"}>
      <div className={showPreview 
        ? "relative w-48 h-36 rounded-lg overflow-hidden border-2 border-primary shadow-glow opacity-80 hover:opacity-100 transition-opacity"
        : "w-0 h-0 overflow-hidden opacity-0"
      }>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={showPreview ? "absolute inset-0 w-full h-full object-cover" : "w-full h-full"}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={showPreview ? "absolute inset-0 w-full h-full object-cover" : "w-full h-full"}
        />
        {showPreview && (
          <>
            <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-primary">
              Webcam Preview
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-primary">
              {fps} FPS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
