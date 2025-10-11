import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { URLInput } from "@/components/URLInput";
import { VideoPlayer, VideoPlayerRef } from "@/components/VideoPlayer";
import { GazeDetector } from "@/components/GazeDetector";
import { StatusIndicator } from "@/components/StatusIndicator";

const Index = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [pauseDelay, setPauseDelay] = useState(2);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isDetectionInitialized, setIsDetectionInitialized] = useState(false);
  
  const playerRef = useRef<VideoPlayerRef>(null);
  const awayTimerRef = useRef<NodeJS.Timeout>();

  const handleGazeChange = useCallback((watching: boolean) => {
    if (!detectionEnabled) return;

    if (watching) {
      // Clear any pending pause timer
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
        awayTimerRef.current = undefined;
      }
      
      // Always play when user looks back
      setIsWatching(true);
      playerRef.current?.play();
    } else {
      // Start pause timer if not already started
      if (!awayTimerRef.current && isWatching) {
        awayTimerRef.current = setTimeout(() => {
          setIsWatching(false);
          playerRef.current?.pause();
          awayTimerRef.current = undefined;
        }, pauseDelay * 1000);
      }
    }
  }, [detectionEnabled, isWatching, pauseDelay]);

  useEffect(() => {
    return () => {
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        pauseDelay={pauseDelay}
        onPauseDelayChange={setPauseDelay}
        detectionEnabled={detectionEnabled}
        onDetectionToggle={setDetectionEnabled}
        previewEnabled={previewEnabled}
        onPreviewToggle={setPreviewEnabled}
      />
      
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />
      
      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {!videoUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-foreground"
                >
                  Watch Videos with Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-primary">
                    Eyes
                  </span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground"
                >
                  Paste any video URL and let your gaze control playback automatically.
                  Look away? Video pauses. Look back? It plays.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full space-y-4"
              >
                {detectionEnabled && (
                  <div className="flex justify-center">
                    <StatusIndicator 
                      isWatching={isWatching} 
                      isDetectionEnabled={detectionEnabled}
                      isInitialized={isDetectionInitialized}
                      error={detectionError}
                      hasVideo={false}
                    />
                  </div>
                )}
                <URLInput onVideoLoad={setVideoUrl} />
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <VideoPlayer
                ref={playerRef}
                url={videoUrl}
                isWatching={isWatching}
                isDetectionEnabled={detectionEnabled}
                error={detectionError}
              />
              
              <div className="flex justify-center">
                <button
                  onClick={() => setVideoUrl("")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Load a different video
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <GazeDetector
        onGazeChange={handleGazeChange}
        onError={setDetectionError}
        onInitialized={setIsDetectionInitialized}
        isEnabled={detectionEnabled && !!videoUrl}
        showPreview={previewEnabled}
      />
    </div>
  );
};

export default Index;
