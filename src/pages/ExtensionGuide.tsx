import { motion } from "framer-motion";
import { Chrome, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ExtensionGuide() {
  const navigate = useNavigate();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/eyeremote-chromeext.crx';
    link.download = 'eyeremote-chromeext.crx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10">
              <Chrome className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              EyeRemote Chrome Extension
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Install the EyeRemote Chrome extension to control video playback on Netflix, 
              Disney+, Hulu, and other streaming platforms using your eyes.
            </p>
          </div>

          {/* Download Section */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Step 1: Download Extension
              </h2>
              <p className="text-muted-foreground">
                Click the button below to download the EyeRemote extension file
              </p>
              <Button
                size="lg"
                onClick={handleDownload}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Download className="w-5 h-5" />
                Download Extension (.crx)
              </Button>
            </div>
          </Card>

          {/* Installation Instructions */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Step 2: Install in Chrome
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Open Chrome Extensions",
                  description: "Type chrome://extensions in your Chrome address bar and press Enter"
                },
                {
                  step: 2,
                  title: "Enable Developer Mode",
                  description: "Toggle the 'Developer mode' switch in the top right corner"
                },
                {
                  step: 3,
                  title: "Drag and Drop",
                  description: "Drag the downloaded .crx file into the Chrome extensions page"
                },
                {
                  step: 4,
                  title: "Confirm Installation",
                  description: "Click 'Add extension' when the confirmation dialog appears"
                },
                {
                  step: 5,
                  title: "Grant Permissions",
                  description: "Allow camera access and any other permissions when prompted"
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Usage Instructions */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Step 3: Start Using EyeRemote
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Navigate to a Video Platform</p>
                  <p className="text-sm text-muted-foreground">Go to Netflix, Disney+, Hulu, or any supported streaming site</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Click the Extension Icon</p>
                  <p className="text-sm text-muted-foreground">Find the EyeRemote icon in your Chrome toolbar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Enable Detection</p>
                  <p className="text-sm text-muted-foreground">Toggle on eye detection and adjust settings as needed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Enjoy Hands-Free Control</p>
                  <p className="text-sm text-muted-foreground">Videos will automatically pause when you look away</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Supported Platforms */}
          <Card className="p-8 bg-muted/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Supported Platforms
            </h2>
            <div className="flex flex-wrap gap-2">
              {["Netflix", "Disney+", "Hulu", "Prime Video", "Max", "Peacock", "YouTube", "Apple TV+"].map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {platform}
                </span>
              ))}
            </div>
          </Card>

          {/* Back Button */}
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
