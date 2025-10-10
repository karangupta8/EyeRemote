"""
Setup script for EyeRemote application
Handles dependency installation and initial setup
"""

import os
import sys
import urllib.request
import zipfile
import subprocess
import platform

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def download_facial_landmarks():
    """Download the required facial landmarks predictor file"""
    landmarks_file = os.path.join("models", "shape_predictor_68_face_landmarks.dat")
    
    if os.path.exists(landmarks_file):
        print(f"✓ {landmarks_file} already exists")
        return True
        
    print("Downloading facial landmarks predictor...")
    url = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
    
    try:
        print("This may take a few minutes...")
        urllib.request.urlretrieve(url, f"{landmarks_file}.bz2")
        
        # Extract the bz2 file
        import bz2
        with bz2.BZ2File(f"{landmarks_file}.bz2", 'rb') as source:
            with open(landmarks_file, 'wb') as target:
                target.write(source.read())
                
        # Clean up the bz2 file
        os.remove(f"{landmarks_file}.bz2")
        print(f"✓ {landmarks_file} downloaded successfully")
        return True
        
    except Exception as e:
        print(f"✗ Failed to download {landmarks_file}: {e}")
        print("You can download it manually from: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2")
        return False

def install_requirements():
    """Install Python requirements"""
    print("Installing Python dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def check_system_requirements():
    """Check if system meets requirements"""
    print("Checking system requirements...")
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("✗ Python 3.7 or higher is required")
        return False
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check platform
    system = platform.system()
    if system not in ['Windows', 'Darwin', 'Linux']:
        print(f"✗ Unsupported platform: {system}")
        return False
    print(f"✓ Platform: {system}")
    
    # Check if camera is available
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✓ Camera detected")
            cap.release()
        else:
            print("⚠ No camera detected - make sure a webcam is connected")
    except ImportError:
        print("⚠ OpenCV not available yet - will be installed with dependencies")
    
    return True

def create_desktop_shortcut():
    """Create desktop shortcut (Windows only)"""
    if platform.system() != 'Windows':
        return
        
    try:
        import winshell
        from win32com.client import Dispatch
        
        desktop = winshell.desktop()
        path = os.path.join(desktop, "EyeRemote.lnk")
        target = os.path.join(os.getcwd(), "eyeremote.py")
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(path)
        shortcut.Targetpath = sys.executable
        shortcut.Arguments = f'"{target}"'
        shortcut.WorkingDirectory = os.getcwd()
        shortcut.IconLocation = sys.executable
        shortcut.save()
        
        print("✓ Desktop shortcut created")
    except ImportError:
        print("⚠ Could not create desktop shortcut (winshell not available)")
    except Exception as e:
        print(f"⚠ Could not create desktop shortcut: {e}")

def main():
    """Main setup function"""
    print("EyeRemote Setup")
    print("=" * 50)
    
    # Check system requirements
    if not check_system_requirements():
        print("\nSetup failed: System requirements not met")
        return False
    
    print()
    
    # Install dependencies
    if not install_requirements():
        print("\nSetup failed: Could not install dependencies")
        return False
    
    print()
    
    # Download facial landmarks
    if not download_facial_landmarks():
        print("\nSetup completed with warnings")
        print("EyeRemote will work with basic face detection")
        print("For better accuracy, download shape_predictor_68_face_landmarks.dat manually")
    
    print()
    
    # Create desktop shortcut
    create_desktop_shortcut()
    
    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("\nTo run EyeRemote:")
    print("  python main.py")
    print("\nOr double-click the desktop shortcut (Windows)")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
