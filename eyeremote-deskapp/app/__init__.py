"""
EyeRemote - Eye-controlled media player
A privacy-focused desktop application that uses webcam eye detection to control media playback.
"""

__version__ = "1.0.0"
__author__ = "Karan Gupta"
__license__ = "MIT"

from .main import EyeRemoteApp
from .eye_detector import EyeDetector
from .config import Config

__all__ = ['EyeRemoteApp', 'EyeDetector', 'Config']
