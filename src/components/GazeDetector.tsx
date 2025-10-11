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
  const lastDetectionStateRef = useRef<boolean | null>(null);

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
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });

        faceLandmarkerRef.current = faceLandmarker;
        setIsInitialized(true);
        onError(null);
        toast.success("Gaze detection initialized");
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
              ctx.fillStyle = 'rgba(124, 58, 237, 0.5)';
              landmarks.forEach((landmark) => {
                ctx.fillRect(
                  landmark.x * canvas.width - 2,
                  landmark.y * canvas.height - 2,
                  4,
                  4
                );
              });
            }
          }
        }
        
        // Detect if face is present and looking at screen
        if (isEnabled) {
          const isFaceDetected = results.faceLandmarks && results.faceLandmarks.length > 0;
          
          // Only trigger callback if state changed
          if (lastDetectionStateRef.current !== isFaceDetected) {
            lastDetectionStateRef.current = isFaceDetected;
            onGazeChange(isFaceDetected);
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
    };
    // showPreview is removed from dependencies as it's now controlled by isEnabled
  }, [isEnabled, onGazeChange, onError, onInitialized]);

  if (!isEnabled || !showPreview) { // Keep this check to hide the component when not needed
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-primary shadow-glow opacity-80 hover:opacity-100 transition-opacity">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-primary">
          Webcam Preview
        </div>
      </div>
    </div>
  );
}
