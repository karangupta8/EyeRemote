import { motion } from "framer-motion";
import { Chrome, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChromeExtensionBannerProps {
  platform?: string;
}

export function ChromeExtensionBanner({ platform = "streaming sites" }: ChromeExtensionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <Card className="p-6 bg-card border-border">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Chrome className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chrome Extension Required for {platform}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              To use EyeRemote with Netflix, Disney+, Hulu, and other streaming platforms, 
              you'll need to install our Chrome extension. The web app works great for YouTube 
              and direct video URLs!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  // Download the .crx file
                  const link = document.createElement('a');
                  link.href = '/eyeremote-chromeext/eyeremote-chromeext.crx';
                  link.download = 'eyeremote-chromeext.crx';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Extension (.crx)
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // Open the extension README
                  window.open('/eyeremote-chromeext/README.md', '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Installation Guide
              </Button>
            </div>
            
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Installation Steps:</strong>
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Download the extension file (.crx)</li>
                <li>Open Chrome and go to <code className="px-1 py-0.5 bg-background rounded">chrome://extensions</code></li>
                <li>Enable "Developer mode" (toggle in top right)</li>
                <li>Drag and drop the .crx file into the extensions page</li>
                <li>Click "Add extension" when prompted</li>
              </ol>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">
                <strong>Supported platforms:</strong> Netflix, Disney+, Hulu, Prime Video, Max, Peacock, and more
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
