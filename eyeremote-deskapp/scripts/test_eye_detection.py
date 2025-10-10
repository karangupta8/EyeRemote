#!/usr/bin/env python3
"""
Quick test script to verify eye detection functionality
"""

import sys
import os
import cv2
import time

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from eye_detector import EyeDetector

def test_eye_detection():
    """Test eye detection with live camera feed"""
    print("Starting eye detection test...")
    print("Press 'q' to quit, 's' to show detection visualization")
    
    try:
        # Initialize eye detector
        detector = EyeDetector()
        
        show_visualization = False
        frame_count = 0
        detection_count = 0
        
        while True:
            if show_visualization:
                # Get frame with visualization
                frame = detector.get_face_detection_with_visualization()
            else:
                # Get normal frame
                frame = detector.get_camera_feed()
            
            if frame is None:
                print("Failed to get camera frame")
                break
            
            # Detect eyes
            eyes_detected = detector.detect_eyes()
            frame_count += 1
            
            if eyes_detected:
                detection_count += 1
            
            # Add status text to frame
            status_text = f"Eyes: {'YES' if eyes_detected else 'NO'} | Frame: {frame_count} | Detections: {detection_count}"
            cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show frame
            cv2.imshow('Eye Detection Test', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                show_visualization = not show_visualization
                print(f"Visualization: {'ON' if show_visualization else 'OFF'}")
        
        # Cleanup
        detector.cleanup()
        cv2.destroyAllWindows()
        
        # Print summary
        detection_rate = (detection_count / frame_count * 100) if frame_count > 0 else 0
        print(f"\nTest Summary:")
        print(f"Total frames: {frame_count}")
        print(f"Eye detections: {detection_count}")
        print(f"Detection rate: {detection_rate:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_eye_detection()
    sys.exit(0 if success else 1)
