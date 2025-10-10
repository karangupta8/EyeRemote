# EyeRemote - Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Eye Detection Algorithm](#eye-detection-algorithm)
5. [Media Control System](#media-control-system)
6. [Configuration Management](#configuration-management)
7. [User Interface](#user-interface)
8. [Installation & Setup](#installation--setup)
9. [API Reference](#api-reference)
10. [Development Guide](#development-guide)
11. [Troubleshooting](#troubleshooting)
12. [Security & Privacy](#security--privacy)
13. [Performance Optimization](#performance-optimization)
14. [Contributing Guidelines](#contributing-guidelines)

---

## Project Overview

EyeRemote is a privacy-focused desktop application that uses computer vision to detect user attention and automatically control media playback. When users look away from their screen for a specified duration, the application pauses media playback. When they return their attention, it automatically resumes.

### Key Features
- **Real-time Eye Detection**: Uses OpenCV and Haar cascades for face and eye detection
- **Cross-platform Media Control**: Supports Windows, macOS, and Linux
- **Privacy-First Design**: All processing happens locally with no cloud dependencies
- **Configurable Timeouts**: Adjustable attention timeout (1-30 seconds)
- **Multi-Face Support**: Can monitor up to 5 people simultaneously
- **Modern GUI**: Built with CustomTkinter for a modern, responsive interface
- **Robust Error Handling**: Comprehensive error handling and fallback mechanisms

### Supported Applications
- **Media Players**: VLC, Windows Media Player, QuickTime
- **Web Browsers**: Chrome, Firefox, Edge, Safari
- **Streaming Services**: YouTube, Netflix, Hulu, etc.
- **Music Players**: Spotify, iTunes
- **Universal**: Any application responding to media play/pause keys

---

## System Architecture

### High-Level Architecture
┌─────────────────────────────────────────────────────────────┐
│ EyeRemote Application │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ GUI │ │ Eye Detection│ │Media Control│ │
│ │ (Tkinter) │ │ (OpenCV) │ │(PyAutoGUI) │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Config Mgmt │ │ Utilities │ │ Models │ │
│ │ (JSON) │ │(Cross-plat) │ │ (Haar/Dlib) │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Operating System APIs │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Camera │ │ Process │ │ Window │ │
│ │ Access │ │ Management │ │ Control │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘

### Component Interaction Flow
1. Camera Capture → 2. Face Detection → 3. Eye Detection → 4. State Analysis
↓
Resume Media ← 7. Eye Detection ← 6. Timer Check ← 5. Pause Media


### Threading Model

The application uses a multi-threaded architecture:

- **Main Thread**: GUI rendering and user interaction
- **Detection Thread**: Camera capture and eye detection processing
- **Background Threads**: Media control and system monitoring

---

## Core Components

### 1. EyeDetector (`app/eye_detector.py`)

The core computer vision component responsible for face and eye detection.

#### Key Methods:
```python
class EyeDetector:
    def __init__(self, camera_index: int = 0)
    def detect_eyes(self, max_faces: int = 1) -> bool
    def detect_eyes_with_details(self, max_faces: int = 1) -> Tuple[bool, List[Tuple]]
    def calculate_eye_aspect_ratio(self, eye_region: np.ndarray) -> float
    def get_face_detection_with_visualization(self) -> Optional[np.ndarray]
    def cleanup(self)
```

#### Detection Pipeline:
1. **Frame Capture**: Uses OpenCV VideoCapture to get camera frames
2. **Preprocessing**: Converts frames to grayscale for Haar cascade detection
3. **Face Detection**: Uses `haarcascade_frontalface_default.xml` to detect faces
4. **Eye Detection**: Uses `haarcascade_eye.xml` to detect eyes within face regions
5. **Validation**: Checks if detected features meet minimum size and quality thresholds

#### Configuration:
- **Camera Resolution**: 640x480 pixels
- **Frame Rate**: 30 FPS
- **Detection Scale Factor**: 1.1
- **Minimum Neighbors**: 5 for faces, 3 for eyes
- **Minimum Size**: 30x30 for faces, 20x20 for eyes

### 2. EyeRemoteApp (`app/main.py`)

The main application class managing the GUI and coordinating all components.

#### Key Features:
- **Modern UI**: CustomTkinter-based interface with responsive design
- **State Management**: Tracks eye detection state with smoothing logic
- **Media Control**: Handles play/pause functionality across different applications
- **Configuration**: Manages user settings and preferences
- **Error Handling**: Comprehensive error handling with user feedback

#### State Smoothing Algorithm:
```python
# Prevents false positives from temporary detection failures
EYES_PRESENT_THRESHOLD = 2  # Frames to confirm eyes are present
NO_EYES_THRESHOLD = 3       # Frames to confirm eyes are gone

if eyes_detected:
    no_eyes_counter = 0
    eyes_present_counter += 1
    if eyes_present_counter >= EYES_PRESENT_THRESHOLD:
        eyes_detected_stable_state = True
else:
    eyes_present_counter = 0
    no_eyes_counter += 1
    if no_eyes_counter >= NO_EYES_THRESHOLD:
        eyes_detected_stable_state = False
```

### 3. Config (`app/config.py`)

Configuration management system using JSON for persistence.

#### Default Configuration:
```json
{
  "timeout": 3,
  "max_faces": 1,
  "target_app": "Any",
  "camera_index": 0,
  "eye_ar_threshold": 0.25,
  "window_geometry": "600x500",
  "always_on_top": false,
  "minimize_to_tray": true
}
```

#### Configuration Methods:
- `load()`: Loads configuration from file with fallback to defaults
- `save()`: Persists configuration to JSON file
- `get(key, default)`: Retrieves configuration values
- `set(key, value)`: Sets configuration values
- `reset_to_defaults()`: Restores default configuration

### 4. Utils (`app/utils.py`)

Cross-platform utility functions for system interaction.

#### Key Functions:
- `get_active_window_info()`: Gets current window information
- `is_media_application()`: Identifies media applications
- `get_camera_list()`: Enumerates available cameras
- `check_camera_permissions()`: Verifies camera access
- `get_system_info()`: Collects system information for debugging
- `check_dependencies()`: Validates required dependencies

---

## Eye Detection Algorithm

### Detection Method

EyeRemote uses a two-stage detection approach:

#### Stage 1: Face Detection
```python
faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.1,      # Image pyramid scaling factor
    minNeighbors=5,       # Minimum neighbors for detection
    minSize=(30, 30),     # Minimum face size
    flags=cv2.CASCADE_SCALE_IMAGE
)
```

#### Stage 2: Eye Detection
```python
eyes = eye_cascade.detectMultiScale(
    face_gray,
    scaleFactor=1.1,      # Image pyramid scaling factor
    minNeighbors=3,       # Minimum neighbors for detection
    minSize=(20, 20)      # Minimum eye size
)
```

### Eye Aspect Ratio (EAR) Calculation

For enhanced accuracy, the system calculates Eye Aspect Ratio:

```python
def calculate_eye_aspect_ratio(self, eye_region: np.ndarray) -> float:
    # Apply Gaussian blur for noise reduction
    eye_region = cv2.GaussianBlur(eye_region, (5, 5), 0)
    
    # Find contours
    contours, _ = cv2.findContours(eye_region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return 0.0
    
    # Get largest contour (the eye)
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Calculate aspect ratio
    x, y, w, h = cv2.boundingRect(largest_contour)
    return w / h if h > 0 else 0.0
```

### Performance Optimizations

1. **Frame Rate Control**: Limited to 30 FPS to balance accuracy and performance
2. **Region of Interest**: Eye detection only within detected face regions
3. **State Smoothing**: Prevents false positives from temporary detection failures
4. **Resource Management**: Proper cleanup of camera resources

---

## Media Control System

### Multi-Platform Media Control

The application implements a hierarchical approach to media control:

#### 1. Windows (Primary Method)
```python
# Direct window messaging for maximum reliability
import win32api
WM_APPCOMMAND = 0x0319
APPCOMMAND_MEDIA_PLAY_PAUSE = 14
lparam = APPCOMMAND_MEDIA_PLAY_PAUSE << 16
win32api.PostMessage(target_hwnd, WM_APPCOMMAND, 0, lparam)
```

#### 2. Cross-Platform Fallback
```python
# PyAutoGUI for universal compatibility
pyautogui.press('playpause')

# Secondary fallback with pynput
from pynput.keyboard import Key, Controller
keyboard = Controller()
keyboard.press(Key.media_play_pause)
keyboard.release(Key.media_play_pause)
```

### Application Targeting

The system can target specific applications or work universally:

#### Target Application Detection:
```python
def _focus_target_app(self, target_app_name, is_test):
    # Find process by name
    target_pid = None
    for proc in psutil.process_iter(['pid', 'name']):
        if target_app_name in proc.info['name'].lower():
            target_pid = proc.info['pid']
            break
    
    # Platform-specific window activation
    if sys.platform == "win32":
        # Windows: Use win32gui for window management
    elif sys.platform == "darwin":
        # macOS: Use AppKit for application activation
    elif sys.platform == "linux":
        # Linux: Use xdotool for window control
```

### Media Control Flow

1. **Target Detection**: Identifies the target application window
2. **Window Focus**: Brings the target application to foreground
3. **Key Injection**: Sends media play/pause command
4. **Verification**: Logs the action for debugging

---

## Configuration Management

### Configuration File Structure

The `eyeremote_config.json` file stores user preferences:

```json
{
  "timeout": 3,                    // Attention timeout in seconds
  "max_faces": 1,                  // Maximum faces to monitor
  "target_app": "Any",             // Target application filter
  "camera_index": 0,               // Camera device index
  "eye_ar_threshold": 0.25,        // Eye aspect ratio threshold
  "window_geometry": "600x500",    // Window size and position
  "always_on_top": false,          // Keep window on top
  "minimize_to_tray": true         // Minimize to system tray
}
```

### Configuration Persistence

- **Auto-Save**: Configuration is automatically saved when changed
- **Merge Strategy**: New options are merged with existing configuration
- **Validation**: Input validation prevents invalid configuration values
- **Backup**: Configuration can be exported/imported for backup

### Configuration API

```python
class Config:
    def get(self, key: str, default: Any = None) -> Any
    def set(self, key: str, value: Any)
    def save(self)
    def load(self)
    def reset_to_defaults(self)
    def export_config(self, filepath: str)
    def import_config(self, filepath: str)
```

---

## User Interface

### GUI Framework

EyeRemote uses CustomTkinter for a modern, responsive interface:

- **Modern Design**: CustomTkinter provides modern UI components
- **Responsive Layout**: Grid-based layout that adapts to window resizing
- **Theme Support**: Light/dark theme support
- **Custom Components**: Custom status cards and visual indicators

### Interface Components

#### 1. Status Card
- **Visual Indicator**: Large, prominent eye detection status
- **Color Coding**: Green for eyes detected, red for no eyes
- **Real-time Updates**: Updates immediately with detection state

#### 2. Configuration Panel
- **Timeout Setting**: Numeric input for attention timeout
- **Face Count**: Maximum faces to monitor
- **Target App**: Dropdown for application selection
- **Validation**: Input validation with error messages

#### 3. Control Buttons
- **Start/Stop Detection**: Primary control buttons
- **Test Media Key**: Functionality testing button
- **State Management**: Button states reflect current operation

#### 4. Activity Log
- **Real-time Logging**: Timestamped activity log
- **Scrollable**: Handles large amounts of log data
- **Monospace Font**: Easy-to-read log formatting

### UI State Management

The interface maintains several states:

- **Initialization**: Loading configuration and dependencies
- **Ready**: Ready to start detection
- **Detecting**: Active eye detection and monitoring
- **Error**: Error state with user feedback
- **Stopped**: Detection stopped, ready to restart

---

## Installation & Setup

### Automated Installation

#### Windows (`install.bat`):
```batch
@echo off
echo Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

#### Linux/macOS (`install.sh`):
```bash
#!/bin/bash
echo "Installing Python dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

echo "Downloading facial landmarks predictor..."
python3 models/download_models.py

echo "Creating desktop entry..."
# Creates .desktop file for Linux
```

### Manual Installation

#### 1. Dependencies Installation:
```bash
pip install -r requirements.txt
```

#### 2. Model Download:
```bash
python models/download_models.py
```

#### 3. Verification:
```bash
python scripts/test_setup.py
```

### System Requirements

#### Minimum Requirements:
- **Python**: 3.7 or higher
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: 2GB minimum, 4GB recommended
- **Camera**: USB webcam or built-in camera
- **Storage**: 100MB for application and models

#### Recommended Requirements:
- **Python**: 3.9 or higher
- **RAM**: 8GB or more
- **Camera**: HD webcam (720p or higher)
- **CPU**: Multi-core processor for better performance

### Dependency Details

#### Core Dependencies:
Detection Pipeline:
Frame Capture: Uses OpenCV VideoCapture to get camera frames
Preprocessing: Converts frames to grayscale for Haar cascade detection
Face Detection: Uses haarcascade_frontalface_default.xml to detect faces
Eye Detection: Uses haarcascade_eye.xml to detect eyes within face regions
Validation: Checks if detected features meet minimum size and quality thresholds
Configuration:
Camera Resolution: 640x480 pixels
Frame Rate: 30 FPS
Detection Scale Factor: 1.1
Minimum Neighbors: 5 for faces, 3 for eyes
Minimum Size: 30x30 for faces, 20x20 for eyes
2. EyeRemoteApp (app/main.py)
The main application class managing the GUI and coordinating all components.
Key Features:
Modern UI: CustomTkinter-based interface with responsive design
State Management: Tracks eye detection state with smoothing logic
Media Control: Handles play/pause functionality across different applications
Configuration: Manages user settings and preferences
Error Handling: Comprehensive error handling with user feedback



#### State Smoothing Algorithm:

# Prevents false positives from temporary detection failures
EYES_PRESENT_THRESHOLD = 2  # Frames to confirm eyes are present
NO_EYES_THRESHOLD = 3       # Frames to confirm eyes are gone

if eyes_detected:
    no_eyes_counter = 0
    eyes_present_counter += 1
    if eyes_present_counter >= EYES_PRESENT_THRESHOLD:
        eyes_detected_stable_state = True
else:
    eyes_present_counter = 0
    no_eyes_counter += 1
    if no_eyes_counter >= NO_EYES_THRESHOLD:
        eyes_detected_stable_state = False

3. Config (app/config.py)
Configuration management system using JSON for persistence.

Default Configuration:

{
  "timeout": 3,
  "max_faces": 1,
  "target_app": "Any",
  "camera_index": 0,
  "eye_ar_threshold": 0.25,
  "window_geometry": "600x500",
  "always_on_top": false,
  "minimize_to_tray": true
}dex`: Index of camera device (default: 0)

#### Methods

##### `detect_eyes(max_faces: int = 1) -> bool`
Detects if eyes are visible in the current frame.

**Parameters:**
- `max_faces`: Maximum number of faces to detect

**Returns:**
- `bool`: True if eyes are detected, False otherwise

##### `detect_eyes_with_details(max_faces: int = 1) -> Tuple[bool, List[Tuple]]`
Detects eyes and returns detailed information.

**Parameters:**
- `max_faces`: Maximum number of faces to detect

**Returns:**
- `Tuple[bool, List[Tuple]]`: (eyes_detected, list_of_eye_rectangles)

##### `calculate_eye_aspect_ratio(eye_region: np.ndarray) -> float`
Calculates eye aspect ratio for enhanced detection accuracy.

**Parameters:**
- `eye_region`: Grayscale image of the eye region

**Returns:**
- `float`: Eye aspect ratio

##### `get_face_detection_with_visualization() -> Optional[np.ndarray]`
Returns current frame with detection visualization.

**Returns:**
- `Optional[np.ndarray]`: Frame with detection rectangles drawn

##### `cleanup()`
Cleans up camera resources and OpenCV windows.

### EyeRemoteApp Class

#### Constructor
```python
EyeRemoteApp()
```
Initializes the main application with GUI and components.

#### Methods

##### `start_detection()`
Starts the eye detection process.

##### `stop_detection()`
Stops the eye detection process.

##### `test_media_key()`
Tests media key functionality.

##### `save_config() -> bool`
Saves current configuration to file.

**Returns:**
- `bool`: True if successful, False if validation failed

##### `load_config()`
Loads configuration from file.

### Config Class

#### Constructor
```python
Config(config_file: str = "eyeremote_config.json")
```
Initializes configuration manager.

**Parameters:**
- `config_file`: Path to configuration file

#### Methods

##### `get(key: str, default: Any = None) -> Any`
Gets configuration value.

**Parameters:**
- `key`: Configuration key
- `default`: Default value if key not found

**Returns:**
- Configuration value or default

##### `set(key: str, value: Any)`
Sets configuration value.

**Parameters:**
- `key`: Configuration key
- `value`: Value to set

##### `save()`
Saves configuration to file.

##### `load()`
Loads configuration from file.

##### `reset_to_defaults()`
Resets configuration to default values.

---

## Development Guide

### Project Structure


Configuration Methods:
load(): Loads configuration from file with fallback to defaults
save(): Persists configuration to JSON file
get(key, default): Retrieves configuration values
set(key, value): Sets configuration values
reset_to_defaults(): Restores default configuration
4. Utils (app/utils.py)
Cross-platform utility functions for system interaction.
Key Functions:
get_active_window_info(): Gets current window information
is_media_application(): Identifies media applications
get_camera_list(): Enumerates available cameras
check_camera_permissions(): Verifies camera access
get_system_info(): Collects system information for debugging
check_dependencies(): Validates required dependencies


Eye Detection Algorithm
Detection Method
EyeRemote uses a two-stage detection approach:
Stage 1: Face Detection

faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.1,      # Image pyramid scaling factor
    minNeighbors=5,       # Minimum neighbors for detection
    minSize=(30, 30),     # Minimum face size
    flags=cv2.CASCADE_SCALE_IMAGE
)
```

#### 3. Install Dependencies:
```bash
pip install -r requirements.txt
```

#### 4. Download Models:
```bash
python models/download_models.py
```

#### 5. Run Tests:
```bash
python scripts/test_setup.py
```

### Code Style Guidelines

#### Python Style:
- Follow PEP 8 guidelines
- Use type hints for function parameters and returns
- Document all public methods and classes
- Use descriptive variable and function names

#### Example:
```python
def detect_eyes(self, max_faces: int = 1) -> bool:
    """
    Detect if eyes are visible in the current frame
    
    Args:
        max_faces: Maximum number of faces to detect
        
    Returns:
        True if eyes are detected, False otherwise
    """
    if not self.is_initialized:
        return False
    
    # Implementation here
    return eyes_detected
```

### Testing

#### Unit Tests:
```bash
python -m pytest tests/
```

#### Integration Tests:
```bash
python scripts/test_setup.py
```

#### Debug Mode:
```bash
python scripts/debug.py
```

### Building and Distribution

#### Windows Executable:
```bash
pyinstaller --onefile --windowed eyeremote.py
```

#### Linux Package:
```bash
python setup.py sdist bdist_wheel
```

#### macOS App Bundle:
```bash
py2app --make-setup eyeremote.py
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Camera Not Working

**Symptoms:**
- "Could not open camera" error
- No video feed in debug mode

**Solutions:**
- Check camera permissions in system settings
- Ensure no other applications are using the camera
- Try different camera index values (0, 1, 2)
- Restart the application
- Check camera drivers

**Debug Steps:**
```bash
python scripts/debug.py  # Test camera directly
python scripts/test_setup.py  # Verify camera access
```

#### 2. Eye Detection Not Working

**Symptoms:**
- No eyes detected despite clear face visibility
- Inconsistent detection results

**Solutions:**
- Improve lighting conditions (avoid backlighting)
- Position face 2-3 feet from camera
- Ensure face is clearly visible and centered
- Adjust eye detection threshold in configuration
- Clean camera lens

**Configuration Adjustment:**
```json
{
  "eye_ar_threshold": 0.20  // Lower value for more sensitive detection
}
```

#### 3. Media Control Issues

**Symptoms:**
- Media doesn't pause/resume
- Wrong application receives commands

**Solutions:**
- Test with "Test Media Key" button
- Ensure target application is in focus
- Set target application to "Any" for broader compatibility
- Check application permissions for input monitoring
- Verify media player supports spacebar play/pause

**Platform-Specific Solutions:**

**Windows:**
- Run as administrator if needed
- Check Windows Defender exclusions
- Verify pywin32 installation

**macOS:**
- Grant accessibility permissions in System Preferences
- Check security settings for input monitoring

**Linux:**
- Install xdotool: `sudo apt-get install xdotool`
- Check X11 permissions

#### 4. Performance Issues

**Symptoms:**
- High CPU usage
- Laggy detection
- Application freezes

**Solutions:**
- Close other applications using the camera
- Reduce max_faces setting
- Lower camera resolution
- Ensure good lighting for faster detection
- Check for background processes

**Performance Tuning:**
```json
{
  "max_faces": 1,           // Reduce for better performance
  "eye_ar_threshold": 0.30  // Higher threshold for faster processing
}
```

#### 5. Dependency Issues

**Symptoms:**
- Import errors
- Missing modules

**Solutions:**
```bash
# Reinstall dependencies
pip uninstall -r requirements.txt
pip install -r requirements.txt

# Update pip
python -m pip install --upgrade pip

# Check Python version
python --version  # Should be 3.7+
```

### Debug Tools

#### 1. Setup Test:
```bash
python scripts/test_setup.py
```
Comprehensive test of all components and dependencies.

#### 2. Debug Mode:
```bash
python scripts/debug.py
```
Real-time camera feed with detection visualization.

#### 3. Keypress Test:
```bash
python scripts/test_keypress.py
```
Tests media key functionality independently.

### Log Analysis

The application provides detailed logging in the activity log:

#### Log Format:


Stage 2: Eye Detection
eyes = eye_cascade.detectMultiScale(
    face_gray,
    scaleFactor=1.1,      # Image pyramid scaling factor
    minNeighbors=3,       # Minimum neighbors for detection
    minSize=(20, 20)      # Minimum eye size
)esume triggered
- `"Initialization failed: [error]"` - Startup error
- `"Focus attempt failed: [error]"` - Window focus issue

### Getting Help

#### 1. Check Logs:
Review the activity log for specific error messages.

#### 2. Run Diagnostics:
```bash
python scripts/test_setup.py
```

#### 3. Verify Configuration:
Check `eyeremote_config.json` for valid values.

#### 4. System Information:
```bash
python -c "from app.utils import get_system_info; print(get_system_info())"
```

---

## Security & Privacy

### Privacy-First Design

EyeRemote is designed with privacy as a core principle:

#### Local Processing:
- **No Internet Required**: All processing happens locally
- **No Data Transmission**: No data is sent to external servers
- **No Cloud Dependencies**: Works completely offline
- **No User Tracking**: No analytics or telemetry

#### Data Handling:
- **No Storage**: Camera frames are processed in memory only
- **No Recording**: No video or image files are created
- **No Personal Data**: No personal information is collected
- **Configuration Only**: Only user preferences are stored locally

### Security Considerations

#### Input Validation:
- All configuration inputs are validated
- File paths are sanitized
- Numeric inputs have range checks

#### Error Handling:
- Sensitive information is not exposed in error messages
- Graceful degradation on errors
- Secure cleanup of resources

#### Code Security:
- Open source code for transparency
- No obfuscation or hidden functionality
- Regular security reviews

### Permissions

#### Required Permissions:

**Windows:**
- Camera access
- Input monitoring (for media control)

**macOS:**
- Camera access (System Preferences > Security & Privacy)
- Accessibility permissions (for media control)

**Linux:**
- Camera access (typically automatic)
- X11 input permissions (for media control)

#### Permission Management:
```bash
# Check current permissions
python -c "from app.utils import check_camera_permissions; print(check_camera_permissions())"
```

---

## Performance Optimization

### Detection Performance

#### Frame Rate Optimization:
- **Target FPS**: 30 FPS for smooth detection
- **Processing Delay**: 0.1 seconds between detection cycles
- **Resource Management**: Proper camera resource cleanup

#### Detection Accuracy:
- **State Smoothing**: Prevents false positives from temporary failures
- **Threshold Tuning**: Configurable sensitivity for different environments
- **Multi-Face Support**: Efficient processing of multiple faces

### Memory Management

#### Resource Cleanup:
```python
def cleanup(self):
    """Clean up resources"""
    if self.cap:
        self.cap.release()
    cv2.destroyAllWindows()
    self.is_initialized = False
```

#### Memory Optimization:
- Camera frames processed in memory only
- No persistent storage of image data
- Efficient numpy array operations

### CPU Optimization

#### Detection Pipeline:
1. **Grayscale Conversion**: Reduces processing overhead
2. **Region of Interest**: Eye detection only within face regions
3. **Cascade Optimization**: Tuned parameters for performance
4. **Threading**: Detection runs in separate thread

#### Performance Monitoring:
```python
# FPS calculation in debug mode
fps_counter += 1
if fps_counter % 30 == 0:
    fps_elapsed = time.time() - fps_start_time
    fps = 30 / fps_elapsed if fps_elapsed > 0 else 0
```

### Configuration for Performance

#### High Performance Settings:
```json
{
  "max_faces": 1,           // Single face detection
  "eye_ar_threshold": 0.30, // Higher threshold for faster processing
  "timeout": 5              // Longer timeout reduces detection frequency
}
```

#### High Accuracy Settings:
```json
{
  "max_faces": 3,           // Multiple face detection
  "eye_ar_threshold": 0.20, // Lower threshold for more sensitive detection
  "timeout": 2              // Shorter timeout for more responsive control
}
```

---

## Contributing Guidelines

### How to Contribute

#### 1. Fork the Repository:
```bash
git fork <repository-url>
```

#### 2. Create Feature Branch:
```bash
git checkout -b feature/new-feature
```

#### 3. Make Changes:
- Follow code style guidelines
- Add tests for new functionality
- Update documentation

#### 4. Test Changes:
```bash
python scripts/test_setup.py
python scripts/debug.py
```

#### 5. Submit Pull Request:
- Clear description of changes
- Reference any related issues
- Ensure all tests pass

### Areas for Contribution

#### 1. Enhanced Detection:
- Improved eye detection algorithms
- Better handling of different lighting conditions
- Support for glasses and accessories

#### 2. Media Player Support:
- Additional media player integrations
- Platform-specific optimizations
- Better application targeting

#### 3. User Interface:
- Additional configuration options
- Better visual feedback
- Accessibility improvements

#### 4. Performance:
- Optimization of detection pipeline
- Better resource management
- Improved threading model

#### 5. Cross-Platform:
- Better Linux support
- macOS-specific optimizations
- Mobile platform support

### Development Standards

#### Code Quality:
- Follow PEP 8 style guidelines
- Use type hints throughout
- Comprehensive error handling
- Unit tests for new functionality

#### Documentation:
- Update this documentation for significant changes
- Add docstrings to all public methods
- Include examples for new features

#### Testing:
- Test on multiple platforms
- Verify with different camera types
- Test with various media players

### Issue Reporting

#### Bug Reports:
Include the following information:
- Operating system and version
- Python version
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

#### Feature Requests:
- Clear description of the feature
- Use case and benefits
- Implementation suggestions if applicable

---

## Conclusion

EyeRemote represents a comprehensive solution for eye-controlled media playback, combining computer vision, cross-platform automation, and modern user interface design. The application prioritizes privacy, performance, and ease of use while providing robust functionality across different operating systems and media players.

The modular architecture allows for easy extension and customization, while the comprehensive documentation ensures maintainability and user understanding. The privacy-first approach ensures that users can enjoy the convenience of eye-controlled media without compromising their personal data or requiring internet connectivity.

For developers, the codebase provides a solid foundation for understanding computer vision applications, cross-platform development, and modern Python GUI programming. The extensive testing and debugging tools make it easy to diagnose and resolve issues.

This documentation serves as both a user guide and developer reference, providing the information needed to understand, use, modify, and contribute to the EyeRemote project.

Eye Aspect Ratio (EAR) Calculation
For enhanced accuracy, the system calculates Eye Aspect Ratio:

def calculate_eye_aspect_ratio(self, eye_region: np.ndarray) -> float:
    # Apply Gaussian blur for noise reduction
    eye_region = cv2.GaussianBlur(eye_region, (5, 5), 0)
    
    # Find contours
    contours, _ = cv2.findContours(eye_region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return 0.0
    
    # Get largest contour (the eye)
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Calculate aspect ratio
    x, y, w, h = cv2.boundingRect(largest_contour)
    return w / h if h > 0 else 0.0


    Performance Optimizations
Frame Rate Control: Limited to 30 FPS to balance accuracy and performance
Region of Interest: Eye detection only within detected face regions
State Smoothing: Prevents false positives from temporary detection failures
Resource Management: Proper cleanup of camera resources
Media Control System
Multi-Platform Media Control
The application implements a hierarchical approach to media control:
1. Windows (Primary Method)
# Direct window messaging for maximum reliability
import win32api
WM_APPCOMMAND = 0x0319
APPCOMMAND_MEDIA_PLAY_PAUSE = 14
lparam = APPCOMMAND_MEDIA_PLAY_PAUSE << 16
win32api.PostMessage(target_hwnd, WM_APPCOMMAND, 0, lparam)

2. Cross-Platform Fallback

# PyAutoGUI for universal compatibility
pyautogui.press('playpause')

# Secondary fallback with pynput
from pynput.keyboard import Key, Controller
keyboard = Controller()
keyboard.press(Key.media_play_pause)
keyboard.release(Key.media_play_pause)


Application Targeting
The system can target specific applications or work universally:

Target Application Detection:
def _focus_target_app(self, target_app_name, is_test):
    # Find process by name
    target_pid = None
    for proc in psutil.process_iter(['pid', 'name']):
        if target_app_name in proc.info['name'].lower():
            target_pid = proc.info['pid']
            break
    
    # Platform-specific window activation
    if sys.platform == "win32":
        # Windows: Use win32gui for window management
    elif sys.platform == "darwin":
        # macOS: Use AppKit for application activation
    elif sys.platform == "linux":
        # Linux: Use xdotool for window control



Media Control Flow
Target Detection: Identifies the target application window
Window Focus: Brings the target application to foreground
Key Injection: Sends media play/pause command
Verification: Logs the action for debugging


Configuration Management
Configuration File Structure
The eyeremote_config.json file stores user preferences:


{
  "timeout": 3,                    // Attention timeout in seconds
  "max_faces": 1,                  // Maximum faces to monitor
  "target_app": "Any",             // Target application filter
  "camera_index": 0,               // Camera device index
  "eye_ar_threshold": 0.25,        // Eye aspect ratio threshold
  "window_geometry": "600x500",    // Window size and position
  "always_on_top": false,          // Keep window on top
  "minimize_to_tray": true         // Minimize to system tray
}



Configuration Persistence
Auto-Save: Configuration is automatically saved when changed
Merge Strategy: New options are merged with existing configuration
Validation: Input validation prevents invalid configuration values
Backup: Configuration can be exported/imported for backup


Configuration API

class Config:
    def get(self, key: str, default: Any = None) -> Any
    def set(self, key: str, value: Any)
    def save(self)
    def load(self)
    def reset_to_defaults(self)
    def export_config(self, filepath: str)
    def import_config(self, filepath: str)


User Interface
GUI Framework
EyeRemote uses CustomTkinter for a modern, responsive interface:
Modern Design: CustomTkinter provides modern UI components
Responsive Layout: Grid-based layout that adapts to window resizing
Theme Support: Light/dark theme support
Custom Components: Custom status cards and visual indicators
Interface Components
1. Status Card
Visual Indicator: Large, prominent eye detection status
Color Coding: Green for eyes detected, red for no eyes
Real-time Updates: Updates immediately with detection state
2. Configuration Panel
Timeout Setting: Numeric input for attention timeout
Face Count: Maximum faces to monitor
Target App: Dropdown for application selection
Validation: Input validation with error messages
3. Control Buttons
Start/Stop Detection: Primary control buttons
Test Media Key: Functionality testing button
State Management: Button states reflect current operation
4. Activity Log
Real-time Logging: Timestamped activity log
Scrollable: Handles large amounts of log data
Monospace Font: Easy-to-read log formatting
UI State Management
The interface maintains several states:
Initialization: Loading configuration and dependencies
Ready: Ready to start detection
Detecting: Active eye detection and monitoring
Error: Error state with user feedback
Stopped: Detection stopped, ready to restart
Installation & Setup
Automated Installation

Windows (install.bat):
@echo off
echo Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt


Linux/macOS (install.sh):

#!/bin/bash
echo "Installing Python dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

echo "Downloading facial landmarks predictor..."
python3 models/download_models.py

echo "Creating desktop entry..."
# Creates .desktop file for Linux


Manual Installation
1. Dependencies Installation:
pip install -r requirements.txt

2. Model Download:
python models/download_models.py

3. Verification:
python scripts/test_setup.py


System Requirements
Minimum Requirements:
Python: 3.7 or higher
Operating System: Windows 10+, macOS 10.14+, or Linux
RAM: 2GB minimum, 4GB recommended
Camera: USB webcam or built-in camera
Storage: 100MB for application and models

Recommended Requirements:
Python: 3.9 or higher
RAM: 8GB or more
Camera: HD webcam (720p or higher)
CPU: Multi-core processor for better performance
Dependency Details
Core Dependencies:

opencv-python          # Computer vision and camera access
numpy>=1.26.0          # Numerical computations
pyautogui             # Cross-platform automation
Pillow                # Image processing
psutil                # System process management
customtkinter         # Modern GUI framework
pynput                # Advanced input control



Platform-Specific:
API Reference
EyeDetector Class
Constructor
Initializes the eye detector with specified camera.
Parameters:
camera_index: Index of camera device (default: 0)
Methods
detect_eyes(max_faces: int = 1) -> bool
Detects if eyes are visible in the current frame.
Parameters:
max_faces: Maximum number of faces to detect
Returns:
bool: True if eyes are detected, False otherwise
detect_eyes_with_details(max_faces: int = 1) -> Tuple[bool, List[Tuple]]
Detects eyes and returns detailed information.
Parameters:
max_faces: Maximum number of faces to detect
Returns:
Tuple[bool, List[Tuple]]: (eyes_detected, list_of_eye_rectangles)
calculate_eye_aspect_ratio(eye_region: np.ndarray) -> float
Calculates eye aspect ratio for enhanced detection accuracy.
Parameters:
eye_region: Grayscale image of the eye region
Returns:
float: Eye aspect ratio
get_face_detection_with_visualization() -> Optional[np.ndarray]
Returns current frame with detection visualization.
Returns:
Optional[np.ndarray]: Frame with detection rectangles drawn
cleanup()
Cleans up camera resources and OpenCV windows.
EyeRemoteApp Class
Constructor
Initializes the main application with GUI and components.
Methods
start_detection()
Starts the eye detection process.
stop_detection()
Stops the eye detection process.
test_media_key()
Tests media key functionality.
save_config() -> bool
Saves current configuration to file.
Returns:
bool: True if successful, False if validation failed
load_config()
Loads configuration from file.
Config Class
Constructor
Initializes configuration manager.
Parameters:
config_file: Path to configuration file
Methods
get(key: str, default: Any = None) -> Any
Gets configuration value.
Parameters:
key: Configuration key
default: Default value if key not found
Returns:
Configuration value or default
set(key: str, value: Any)
Sets configuration value.
Parameters:
key: Configuration key
value: Value to set
save()
Saves configuration to file.
load()
Loads configuration from file.
reset_to_defaults()
Resets configuration to default values.
Development Guide
Project Structure
Development Setup
1. Clone Repository:
2. Create Virtual Environment:
3. Install Dependencies:
4. Download Models:
5. Run Tests:
Code Style Guidelines
Python Style:
Follow PEP 8 guidelines
Use type hints for function parameters and returns
Document all public methods and classes
Use descriptive variable and function names
Example:
Testing
Unit Tests:
Integration Tests:
Debug Mode:
Building and Distribution
Windows Executable:
Linux Package:
macOS App Bundle:
Troubleshooting
Common Issues and Solutions
1. Camera Not Working
Symptoms:
"Could not open camera" error
No video feed in debug mode
Solutions:
Check camera permissions in system settings
Ensure no other applications are using the camera
Try different camera index values (0, 1, 2)
Restart the application
Check camera drivers
Debug Steps:
2. Eye Detection Not Working
Symptoms:
No eyes detected despite clear face visibility
Inconsistent detection results
Solutions:
Improve lighting conditions (avoid backlighting)
Position face 2-3 feet from camera
Ensure face is clearly visible and centered
Adjust eye detection threshold in configuration
Clean camera lens
Configuration Adjustment:
3. Media Control Issues
Symptoms:
Media doesn't pause/resume
Wrong application receives commands
Solutions:
Test with "Test Media Key" button
Ensure target application is in focus
Set target application to "Any" for broader compatibility
Check application permissions for input monitoring
Verify media player supports spacebar play/pause
Platform-Specific Solutions:
Windows:
Run as administrator if needed
Check Windows Defender exclusions
Verify pywin32 installation
macOS:
Grant accessibility permissions in System Preferences
Check security settings for input monitoring
Linux:
Install xdotool: sudo apt-get install xdotool
Check X11 permissions
4. Performance Issues
Symptoms:
High CPU usage
Laggy detection
Application freezes
Solutions:
Close other applications using the camera
Reduce max_faces setting
Lower camera resolution
Ensure good lighting for faster detection
Check for background processes
Performance Tuning:
5. Dependency Issues
Symptoms:
Import errors
Missing modules
Solutions:
Debug Tools
1. Setup Test:
Comprehensive test of all components and dependencies.
2. Debug Mode:
Real-time camera feed with detection visualization.
3. Keypress Test:
Tests media key functionality independently.
Log Analysis
The application provides detailed logging in the activity log:
Log Format:
Common Log Messages:
"Eye detection started" - Detection successfully initialized
"Media paused - eyes not detected for Xs" - Automatic pause triggered
"Media resumed - eyes detected" - Automatic resume triggered
"Initialization failed: [error]" - Startup error
"Focus attempt failed: [error]" - Window focus issue
Getting Help
1. Check Logs:
Review the activity log for specific error messages.
2. Run Diagnostics:
3. Verify Configuration:
Check eyeremote_config.json for valid values.
4. System Information:
Security & Privacy
Privacy-First Design
EyeRemote is designed with privacy as a core principle:
Local Processing:
No Internet Required: All processing happens locally
No Data Transmission: No data is sent to external servers
No Cloud Dependencies: Works completely offline
No User Tracking: No analytics or telemetry
Data Handling:
No Storage: Camera frames are processed in memory only
No Recording: No video or image files are created
No Personal Data: No personal information is collected
Configuration Only: Only user preferences are stored locally
Security Considerations
Input Validation:
All configuration inputs are validated
File paths are sanitized
Numeric inputs have range checks
Error Handling:
Sensitive information is not exposed in error messages
Graceful degradation on errors
Secure cleanup of resources
Code Security:
Open source code for transparency
No obfuscation or hidden functionality
Regular security reviews
Permissions
Required Permissions:
Windows:
Camera access
Input monitoring (for media control)
macOS:
Camera access (System Preferences > Security & Privacy)
Accessibility permissions (for media control)
Linux:
Camera access (typically automatic)
X11 input permissions (for media control)
Permission Management:
Performance Optimization
Detection Performance
Frame Rate Optimization:
Target FPS: 30 FPS for smooth detection
Processing Delay: 0.1 seconds between detection cycles
Resource Management: Proper camera resource cleanup
Detection Accuracy:
State Smoothing: Prevents false positives from temporary failures
Threshold Tuning: Configurable sensitivity for different environments
Multi-Face Support: Efficient processing of multiple faces
Memory Management
Resource Cleanup:
Memory Optimization:
Camera frames processed in memory only
No persistent storage of image data
Efficient numpy array operations
CPU Optimization
Detection Pipeline:
Grayscale Conversion: Reduces processing overhead
Region of Interest: Eye detection only within face regions
Cascade Optimization: Tuned parameters for performance
Threading: Detection runs in separate thread
Performance Monitoring:
Configuration for Performance
High Performance Settings:
High Accuracy Settings:
Contributing Guidelines
How to Contribute
1. Fork the Repository:
2. Create Feature Branch:
3. Make Changes:
Follow code style guidelines
Add tests for new functionality
Update documentation
4. Test Changes:
5. Submit Pull Request:
Clear description of changes
Reference any related issues
Ensure all tests pass
Areas for Contribution
1. Enhanced Detection:
Improved eye detection algorithms
Better handling of different lighting conditions
Support for glasses and accessories
2. Media Player Support:
Additional media player integrations
Platform-specific optimizations
Better application targeting
3. User Interface:
Additional configuration options
Better visual feedback
Accessibility improvements
4. Performance:
Optimization of detection pipeline
Better resource management
Improved threading model
5. Cross-Platform:
Better Linux support
macOS-specific optimizations
Mobile platform support
Development Standards
Code Quality:
Follow PEP 8 style guidelines
Use type hints throughout
Comprehensive error handling
Unit tests for new functionality
Documentation:
Update this documentation for significant changes
Add docstrings to all public methods
Include examples for new features
Testing:
Test on multiple platforms
Verify with different camera types
Test with various media players
Issue Reporting
Bug Reports:
Include the following information:
Operating system and version
Python version
Error messages and logs
Steps to reproduce
Expected vs actual behavior
Feature Requests:
Clear description of the feature
Use case and benefits
Implementation suggestions if applicable
Conclusion
EyeRemote represents a comprehensive solution for eye-controlled media playback, combining computer vision, cross-platform automation, and modern user interface design. The application prioritizes privacy, performance, and ease of use while providing robust functionality across different operating systems and media players.
The modular architecture allows for easy extension and customization, while the comprehensive documentation ensures maintainability and user understanding. The privacy-first approach ensures that users can enjoy the convenience of eye-controlled media without compromising their personal data or requiring internet connectivity.
For developers, the codebase provides a solid foundation for understanding computer vision applications, cross-platform development, and modern Python GUI programming. The extensive testing and debugging tools make it easy to diagnose and resolve issues.
This documentation serves as both a user guide and developer reference, providing the information needed to understand, use, modify, and contribute to the EyeRemote project.