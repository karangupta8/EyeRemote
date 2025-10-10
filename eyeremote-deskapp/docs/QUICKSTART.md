# EyeRemote Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

**Windows:**
```bash
installers/install.bat
```

**macOS/Linux:**
```bash
chmod +x installers/install.sh
./installers/install.sh
```

**Manual Installation:**
```bash
pip install -r requirements.txt
```

### 2. Download Facial Landmarks (Required for Best Accuracy)

The application needs a facial landmarks predictor file. Run this Python script:

```python
import urllib.request
import bz2
import os

landmarks_file = 'shape_predictor_68_face_landmarks.dat'
if not os.path.exists(landmarks_file):
    print("Downloading facial landmarks...")
    urllib.request.urlretrieve(
        'http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2', 
        f'{landmarks_file}.bz2'
    )
    with bz2.BZ2File(f'{landmarks_file}.bz2', 'rb') as source:
        with open(landmarks_file, 'wb') as target:
            target.write(source.read())
    os.remove(f'{landmarks_file}.bz2')
    print("Download complete!")
```

### 3. Run EyeRemote

```bash
python eyeremote.py
```

## 🎯 Basic Usage

1. **Click "Start Detection"** to begin monitoring
2. **Position yourself** 2-3 feet from your webcam
3. **Ensure good lighting** on your face
4. **Open your media player** (VLC, YouTube, Netflix, etc.)
5. **Look away** for more than 3 seconds to pause
6. **Look back** to automatically resume

## ⚙️ Configuration

- **Attention Timeout**: How long to wait before pausing (1-30 seconds)
- **Max Faces**: Number of people to monitor (1-5)
- **Target Application**: Filter for specific apps (Any, VLC, Chrome, etc.)

## 🐛 Troubleshooting

### Test Your Setup
```bash
python scripts/test_setup.py
```

### Common Issues

**Camera not working:**
- Check camera permissions
- Ensure no other apps are using the camera
- Try changing camera index in settings

**Detection not working:**
- Improve lighting conditions
- Position face clearly in camera view
- Adjust eye detection threshold

**Media not pausing:**
- Test with "Test Spacebar" button
- Ensure media player is in focus
- Try setting target app to "Any"

## 🔧 Advanced Features

### Debug Mode
```bash
python scripts/debug.py
```
Shows real-time camera feed with face detection overlay.

### Configuration File
Settings are saved in `eyeremote_config.json` and can be manually edited.

## 📱 Supported Applications

- **VLC Media Player**
- **Web Browsers** (Chrome, Firefox, Edge, Safari)
- **Streaming Services** (YouTube, Netflix, Hulu, etc.)
- **Music Players** (Spotify, iTunes, etc.)
- **Any application** that responds to spacebar (play/pause)

## 🔒 Privacy

- ✅ All processing happens locally
- ✅ No internet connection required
- ✅ No data collection or transmission
- ✅ Open source code

## 🆘 Need Help?

1. Check the troubleshooting section
2. Review the activity log in the app
3. Run the test script: `python test_setup.py`
4. Ensure all dependencies are installed correctly

---

**Ready to go?** Run `python eyeremote.py` and start controlling your media with your eyes! 👁️
