import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Camera, CameraOff, Loader2 } from "lucide-react";

interface StatusIndicatorProps {
  isWatching: boolean;
  isDetectionEnabled: boolean;
  isInitialized: boolean;
  error?: string | null;
  hasVideo?: boolean;
}

export function StatusIndicator({ isWatching, isDetectionEnabled, isInitialized, error, hasVideo = false }: StatusIndicatorProps) {
  // Show error states first (highest priority)
  if (error === "permission-denied") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30"
      >
        <CameraOff className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Camera Permission Denied</span>
      </motion.div>
    );
  }

  if (error === "no-camera") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30"
      >
        <Camera className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">No Camera Found</span>
      </motion.div>
    );
  }

  if (error === "initialization-failed" || error === "camera-error") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30"
      >
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Detection Error</span>
      </motion.div>
    );
  }

  // Show detection disabled state
  if (!isDetectionEnabled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
        <EyeOff className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Detection Off</span>
      </div>
    );
  }

  // Show waiting state when no video is loaded
  if (!hasVideo) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
        <Camera className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Waiting for Video</span>
      </div>
    );
  }

  // Show initializing state (detection enabled, video loaded, but camera not initialized yet)
  if (!isInitialized) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border"
      >
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        <span className="text-sm text-muted-foreground">Initializing Camera...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
        isWatching
          ? "bg-success/10 border-success/30"
          : "bg-destructive/10 border-destructive/30"
      }`}
    >
      <motion.div
        animate={{
          scale: isWatching ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`w-2 h-2 rounded-full ${
          isWatching ? "bg-success" : "bg-destructive"
        }`}
      />
      <Eye className={`w-4 h-4 ${isWatching ? "text-success" : "text-destructive"}`} />
      <span className={`text-sm font-medium ${isWatching ? "text-success" : "text-destructive"}`}>
        {isWatching ? "Watching" : "Away"}
      </span>
    </motion.div>
  );
}
