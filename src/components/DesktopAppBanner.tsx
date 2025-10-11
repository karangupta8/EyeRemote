import { motion } from "framer-motion";
import { Download, Monitor, Shield, Zap } from "lucide-react";

export function DesktopAppBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 md:p-8 shadow-elegant">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Monitor className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Want This for <span className="text-transparent bg-clip-text bg-gradient-primary">Any Player?</span>
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Download our desktop app to control YouTube, Netflix, VLC, and any media player with your eyes. 
              <span className="font-medium text-foreground"> 100% local. Zero tracking.</span>
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Privacy First</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Works Offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Universal Support</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <a
              href="https://github.com/yourusername/eyeremote"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Download Desktop App
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
