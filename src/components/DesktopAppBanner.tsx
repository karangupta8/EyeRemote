import { motion } from "framer-motion";
import { Download, Monitor, Shield, Zap, Chrome, Puzzle, Globe } from "lucide-react";

export function DesktopAppBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-2xl md:text-3xl font-bold">
          Take EyeRemote <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Beyond the Web</span>
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          Choose your platform and unlock hands-free control everywhere
        </p>
      </div>

      {/* Two-Card Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Desktop App Card */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col gap-4">
            {/* Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-foreground">Desktop App</h4>
                <p className="text-xs text-primary font-medium">Control ANY Media Player</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              Run eye-tracking control for <span className="text-foreground font-medium">YouTube, Netflix, VLC, and any media player</span> on your desktop. Full control, complete privacy.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">100% Private</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Works Offline</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Universal Support</span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="https://github.com/karangupta8/EyeRemote/tree/main/eyeremote-deskapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105 shadow-md text-sm"
            >
              <Download className="w-4 h-4" />
              Get Desktop App
            </a>
          </div>
        </div>

        {/* Chrome Extension Card */}
        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-blue-500/10 p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col gap-4">
            {/* Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-foreground">Chrome Extension</h4>
                <p className="text-xs text-blue-500 font-medium">Seamless YouTube Control</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">YouTube-optimized</span> eye-tracking control directly in your browser. One-click install, zero configuration.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50">
                <Chrome className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-muted-foreground">YouTube Only</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-muted-foreground">One-Click Install</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-muted-foreground">No Setup</span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="/eyeremote-chromeext/eyeremote-chromeext.crx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all hover:scale-105 shadow-md text-sm"
            >
              <Download className="w-4 h-4" />
              Get Chrome Extension
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
