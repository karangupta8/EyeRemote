import { motion } from "framer-motion";
import { X, Clock, Eye, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pauseDelay: number;
  onPauseDelayChange: (value: number) => void;
  detectionEnabled: boolean;
  onDetectionToggle: (enabled: boolean) => void;
  previewEnabled: boolean;
  onPreviewToggle: (enabled: boolean) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  pauseDelay,
  onPauseDelayChange,
  detectionEnabled,
  onDetectionToggle,
  previewEnabled,
  onPreviewToggle,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
      />
      
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-secondary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Detection Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <Label htmlFor="detection-toggle" className="text-base font-medium">
                    Gaze Detection
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable automatic play/pause based on your gaze
                </p>
              </div>
              <Switch
                id="detection-toggle"
                checked={detectionEnabled}
                onCheckedChange={(checked) => {
                  onDetectionToggle(checked);
                  if (!checked) {
                    onPreviewToggle(false); // Also turn off preview
                  }
                }}
              />
            </div>
          </div>

          {/* Pause Delay Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <Label htmlFor="pause-delay" className="text-base font-medium">
                  Pause Delay
                </Label>
              </div>
              <span className="text-sm font-medium text-primary">{pauseDelay}s</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Time before pausing when you look away
            </p>
            <Slider
              id="pause-delay"
              min={1}
              max={5}
              step={1}
              value={[pauseDelay]}
              onValueChange={([value]) => onPauseDelayChange(value)}
              disabled={!detectionEnabled}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1s</span>
              <span>5s</span>
            </div>
          </div>

          {/* Webcam Preview Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <Label htmlFor="preview-toggle" className="text-base font-medium">
                    Webcam Preview
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show webcam feed with face detection overlay
                </p>
              </div>
              <Switch
                id="preview-toggle"
                checked={previewEnabled}
                onCheckedChange={onPreviewToggle}
                disabled={!detectionEnabled}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-sm font-medium text-foreground mb-2">How it works</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Video plays when you're looking at the screen</li>
              <li>• Video pauses when you look away or leave</li>
              <li>• Adjust delay to fine-tune sensitivity</li>
              <li>• Works with YouTube, Vimeo, and MP4 files</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </>
  );
}
