"""
Utility functions for EyeRemote application
"""

import os
import sys
import platform
import subprocess
import psutil
from typing import List, Optional, Dict

def get_active_window_info() -> Dict[str, str]:
    """
    Get information about the currently active window
    
    Returns:
        Dictionary with window title, process name, and executable path
    """
    try:
        if platform.system() == 'Windows':
            import win32gui
            import win32process
            
            hwnd = win32gui.GetForegroundWindow()
            window_title = win32gui.GetWindowText(hwnd)
            
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            process = psutil.Process(pid)
            
            return {
                'title': window_title,
                'process_name': process.name(),
                'exe_path': process.exe(),
                'pid': pid
            }
        else:
            # For macOS and Linux, this would need platform-specific implementations
            return {
                'title': 'Unknown',
                'process_name': 'Unknown',
                'exe_path': 'Unknown',
                'pid': 0
            }
    except Exception as e:
        return {
            'title': f'Error: {str(e)}',
            'process_name': 'Unknown',
            'exe_path': 'Unknown',
            'pid': 0
        }

def is_media_application(process_name: str) -> bool:
    """
    Check if the given process name is likely a media application
    
    Args:
        process_name: Name of the process
        
    Returns:
        True if it's likely a media application
    """
    media_apps = [
        'vlc', 'vlc.exe',
        'chrome', 'chrome.exe',
        'firefox', 'firefox.exe',
        'msedge', 'msedge.exe',
        'safari', 'safari.exe',
        'netflix', 'netflix.exe',
        'spotify', 'spotify.exe',
        'itunes', 'itunes.exe',
        'windowsmediaplayer', 'wmplayer.exe',
        'quicktime', 'quicktime player.app',
        'mpv', 'mpv.exe',
        'mplayer', 'mplayer.exe',
        'kodi', 'kodi.exe'
    ]
    
    process_lower = process_name.lower()
    return any(app in process_lower for app in media_apps)

def get_camera_list() -> List[Dict[str, str]]:
    """
    Get list of available cameras
    
    Returns:
        List of dictionaries with camera info
    """
    cameras = []
    
    try:
        import cv2
        
        # Test cameras 0-9
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                # Try to get camera name (not always available)
                camera_name = f"Camera {i}"
                
                # On Windows, try to get more specific info
                if platform.system() == 'Windows':
                    try:
                        import win32api
                        # This is a simplified approach - real camera enumeration would be more complex
                        camera_name = f"Camera {i}"
                    except:
                        pass
                
                cameras.append({
                    'index': i,
                    'name': camera_name,
                    'available': True
                })
                cap.release()
            else:
                break
                
    except Exception as e:
        print(f"Error enumerating cameras: {e}")
        
    return cameras

def check_camera_permissions() -> bool:
    """
    Check if camera access is available
    
    Returns:
        True if camera access is available
    """
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            cap.release()
            return ret and frame is not None
        return False
    except Exception:
        return False

def get_system_info() -> Dict[str, str]:
    """
    Get system information for debugging
    
    Returns:
        Dictionary with system information
    """
    info = {
        'platform': platform.system(),
        'platform_version': platform.version(),
        'architecture': platform.architecture()[0],
        'python_version': sys.version,
        'python_executable': sys.executable
    }
    
    # Add OpenCV version if available
    try:
        import cv2
        info['opencv_version'] = cv2.__version__
    except ImportError:
        info['opencv_version'] = 'Not installed'
        
    # Add dlib version if available
    try:
        import dlib
        info['dlib_version'] = dlib.__version__
    except ImportError:
        info['dlib_version'] = 'Not installed'
        
    return info

def create_startup_shortcut():
    """
    Create a shortcut to start EyeRemote at system startup (Windows only)
    """
    if platform.system() != 'Windows':
        return False
        
    try:
        import winshell
        from win32com.client import Dispatch
        
        startup_folder = winshell.startup()
        shortcut_path = os.path.join(startup_folder, "EyeRemote.lnk")
        
        target_path = os.path.join(os.getcwd(), "main.py")
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.Targetpath = sys.executable
        shortcut.Arguments = f'"{target_path}"'
        shortcut.WorkingDirectory = os.getcwd()
        shortcut.IconLocation = sys.executable
        shortcut.save()
        
        return True
    except Exception as e:
        print(f"Could not create startup shortcut: {e}")
        return False

def remove_startup_shortcut():
    """
    Remove the startup shortcut (Windows only)
    """
    if platform.system() != 'Windows':
        return False
        
    try:
        import winshell
        
        startup_folder = winshell.startup()
        shortcut_path = os.path.join(startup_folder, "EyeRemote.lnk")
        
        if os.path.exists(shortcut_path):
            os.remove(shortcut_path)
            return True
        return False
    except Exception as e:
        print(f"Could not remove startup shortcut: {e}")
        return False

def check_dependencies() -> Dict[str, bool]:
    """
    Check if all required dependencies are available
    
    Returns:
        Dictionary with dependency availability status
    """
    dependencies = {}
    
    # Check Python packages
    packages = ['cv2', 'numpy', 'pyautogui', 'psutil', 'tkinter']
    
    for package in packages:
        try:
            if package == 'cv2':
                import cv2
            elif package == 'numpy':
                import numpy
            elif package == 'pyautogui':
                import pyautogui
            elif package == 'psutil':
                import psutil
            elif package == 'tkinter':
                import tkinter
                
            dependencies[package] = True
        except ImportError:
            dependencies[package] = False
            
    # Check if OpenCV has the required Haar cascades
    try:
        import cv2
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
        dependencies['face_cascade'] = os.path.exists(face_cascade_path)
        dependencies['eye_cascade'] = os.path.exists(eye_cascade_path)
    except:
        dependencies['face_cascade'] = False
        dependencies['eye_cascade'] = False
    
    return dependencies

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    if size_bytes == 0:
        return "0 B"
        
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
        
    return f"{size_bytes:.1f} {size_names[i]}"
