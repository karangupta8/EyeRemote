#!/usr/bin/env python3
"""
EyeRemote - Eye-controlled media player
Root-level launcher script
"""

import sys
import os

# Add the current directory to Python path to allow imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        from app.main import EyeRemoteApp
        
        # Create and run the application
        app = EyeRemoteApp()
        app.run()
    except ImportError as e:
        print(f"Import error: {e}")
        print("Make sure you're running from the EyeRemote directory and all dependencies are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"Application error: {e}")
        sys.exit(1)