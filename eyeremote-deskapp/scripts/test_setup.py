#!/usr/bin/env python3
"""
Test script to verify EyeRemote setup and dependencies
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    modules = [
        ('cv2', 'OpenCV'),
        ('numpy', 'NumPy'),
        ('pyautogui', 'PyAutoGUI'),
        ('psutil', 'psutil'),
        ('tkinter', 'Tkinter'),
        ('PIL', 'Pillow')
    ]
    
    failed_imports = []
    
    for module, name in modules:
        try:
            __import__(module)
            print(f"[OK] {name}")
        except ImportError as e:
            print(f"[FAIL] {name}: {e}")
            failed_imports.append(name)
    
    return len(failed_imports) == 0

def test_camera():
    """Test camera access"""
    print("\nTesting camera...")
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("[FAIL] Camera not accessible")
            return False
            
        ret, frame = cap.read()
        cap.release()
        
        if ret and frame is not None:
            print(f"[OK] Camera working (frame size: {frame.shape})")
            return True
        else:
            print("[FAIL] Camera not capturing frames")
            return False
            
    except Exception as e:
        print(f"[FAIL] Camera test failed: {e}")
        return False

def test_opencv_face_detection():
    """Test OpenCV face detection"""
    print("\nTesting OpenCV face detection...")
    
    try:
        import cv2
        
        # Test if Haar cascades are available
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
        
        if not os.path.exists(face_cascade_path):
            print(f"[FAIL] Face cascade not found: {face_cascade_path}")
            return False
            
        if not os.path.exists(eye_cascade_path):
            print(f"[FAIL] Eye cascade not found: {eye_cascade_path}")
            return False
        
        # Test cascade loading
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        eye_cascade = cv2.CascadeClassifier(eye_cascade_path)
        
        if face_cascade.empty() or eye_cascade.empty():
            print("[FAIL] Failed to load Haar cascades")
            return False
            
        print("[OK] OpenCV face and eye cascades loaded successfully")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to initialize OpenCV face detection: {e}")
        return False

def test_keyboard_automation():
    """Test keyboard automation"""
    print("\nTesting keyboard automation...")
    
    try:
        import pyautogui
        # Test if pyautogui can access the system
        screen_size = pyautogui.size()
        print(f"[OK] PyAutoGUI working (screen size: {screen_size})")
        return True
    except Exception as e:
        print(f"[FAIL] PyAutoGUI test failed: {e}")
        return False

def test_gui():
    """Test GUI framework"""
    print("\nTesting GUI...")
    
    try:
        import tkinter as tk
        root = tk.Tk()
        root.withdraw()  # Hide the window
        root.destroy()
        print("[OK] Tkinter working")
        return True
    except Exception as e:
        print(f"[FAIL] Tkinter test failed: {e}")
        return False

def test_eye_detector():
    """Test eye detector initialization"""
    print("\nTesting eye detector...")
    
    try:
        from app.eye_detector import EyeDetector
        detector = EyeDetector()
        print("[OK] EyeDetector initialized")
        detector.cleanup()
        return True
    except Exception as e:
        print(f"[FAIL] EyeDetector test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("EyeRemote Setup Test")
    print("=" * 50)
    
    tests = [
        ("Dependencies", test_imports),
        ("Camera", test_camera),
        ("OpenCV Face Detection", test_opencv_face_detection),
        ("Keyboard Automation", test_keyboard_automation),
        ("GUI", test_gui),
        ("Eye Detector", test_eye_detector)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"[FAIL] {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("Test Results:")
    
    passed = 0
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n[OK] All tests passed! EyeRemote should work correctly.")
        return True
    else:
        print(f"\n[WARNING] {len(results) - passed} tests failed. Check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
