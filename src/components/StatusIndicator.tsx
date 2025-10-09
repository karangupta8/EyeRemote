import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface StatusIndicatorProps {
  isWatching: boolean;
  isDetectionEnabled: boolean;
}

export function StatusIndicator({ isWatching, isDetectionEnabled }: StatusIndicatorProps) {
  if (!isDetectionEnabled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
        <EyeOff className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Detection Off</span>
      </div>
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
