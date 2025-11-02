import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChromeExtensionBanner } from "./ChromeExtensionBanner";

interface URLInputProps {
  onVideoLoad: (url: string) => void;
}

const STREAMING_PLATFORMS = [
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'Hulu', domain: 'hulu.com' },
  { name: 'Prime Video', domain: 'primevideo.com' },
  { name: 'Max', domain: 'max.com' },
  { name: 'Peacock', domain: 'peacocktv.com' },
];

function detectStreamingPlatform(url: string): string | null {
  const urlLower = url.toLowerCase();
  for (const platform of STREAMING_PLATFORMS) {
    if (urlLower.includes(platform.domain)) {
      return platform.name;
    }
  }
  return null;
}

export function URLInput({ onVideoLoad }: URLInputProps) {
  const [url, setUrl] = useState("");
  const [showExtensionBanner, setShowExtensionBanner] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a video URL");
      return;
    }
    
    // Check if it's a streaming platform
    const platform = detectStreamingPlatform(url);
    if (platform) {
      setDetectedPlatform(platform);
      setShowExtensionBanner(true);
      toast.info(`${platform} requires the Chrome Extension`);
      return;
    }
    
    setShowExtensionBanner(false);
    setDetectedPlatform(null);
    onVideoLoad(url);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Vimeo, or MP4 URL..."
              className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Play className="w-5 h-5 mr-2" />
            Load Video
          </Button>
        </form>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {[
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://vimeo.com/76979871"
          ].map((exampleUrl, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setUrl(exampleUrl)}
              className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
              Example {index + 1}
            </button>
          ))}
        </div>
      </motion.div>
      
      {showExtensionBanner && (
        <ChromeExtensionBanner platform={detectedPlatform || "streaming sites"} />
      )}
    </>
  );
}
