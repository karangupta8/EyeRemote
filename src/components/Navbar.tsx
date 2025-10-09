import { Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenSettings: () => void;
}

export function Navbar({ onOpenSettings }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">EyeRemote</h1>
            <p className="text-xs text-muted-foreground">Your eyes are the play button</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="hover:bg-primary/10"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
