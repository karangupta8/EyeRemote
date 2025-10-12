import { Eye, Clock, Video } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface NavbarProps {
  pauseDelay: number;
  onPauseDelayChange: (value: number) => void;
  detectionEnabled: boolean;
  onDetectionToggle: (enabled: boolean) => void;
  previewEnabled: boolean;
  onPreviewToggle: (enabled: boolean) => void;
  onLogoClick: () => void;
}

export function Navbar({
  pauseDelay,
  onPauseDelayChange,
  detectionEnabled,
  onDetectionToggle,
  previewEnabled,
  onPreviewToggle,
  onLogoClick,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <button onClick={onLogoClick} className="flex items-center gap-3 flex-shrink-0 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Eye className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-bold text-foreground">EyeRemote</h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Your eyes are the play button
              </p>
            </div>
          </button>
          
          {/* Settings Controls */}
          <div className="flex items-center gap-3 md:gap-6 flex-wrap">
            {/* Detection Toggle */}
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <Label htmlFor="detection" className="text-sm cursor-pointer hidden md:inline">Detection</Label>
              <Switch
                id="detection"
                checked={detectionEnabled}
                onCheckedChange={onDetectionToggle}
              />
            </div>

            {/* Pause Delay */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <Label className="text-sm hidden md:inline">Delay: </Label>
              <Label className="text-sm">{pauseDelay}s</Label>
              <Slider
                min={1}
                max={5}
              step={1}
              value={[pauseDelay]}
              onValueChange={([value]) => onPauseDelayChange(value)}
              disabled={!detectionEnabled}
              className="w-16 md:w-24"
              />
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <Label htmlFor="preview" className="text-sm cursor-pointer hidden md:inline">Preview</Label>
              <Switch
                id="preview"
                checked={previewEnabled}
                onCheckedChange={onPreviewToggle}
                disabled={!detectionEnabled}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
