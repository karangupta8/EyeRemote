"""
Eye detection module using OpenCV
Handles face detection and eye tracking for gaze detection
"""

import os
import cv2
import numpy as np
import threading
import time
from typing import List, Tuple, Optional

class EyeDetector:
    def __init__(self, camera_index: int = 0):
        """
        Initialize eye detector with webcam
        
        Args:
            camera_index: Index of camera to use (default: 0)
        """
        self.camera_index = camera_index
        self.cap = None
        self.face_cascade = None
        self.eye_cascade = None
        self.is_initialized = False
        
        # Eye detection parameters
        self.eye_ar_threshold = 0.25  # Eye aspect ratio threshold
        self.eye_ar_consec_frames = 2  # Consecutive frames for eye closure detection
        
        # Initialize components
        self._initialize_components()
        
    def _initialize_components(self):
        """Initialize OpenCV camera and face/eye cascades"""
        try:
            # Initialize camera
            self.cap = cv2.VideoCapture(self.camera_index)
            if not self.cap.isOpened():
                raise Exception(f"Could not open camera {self.camera_index}")
                
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            # Initialize OpenCV Haar cascades
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            
            # Verify cascades loaded successfully
            if self.face_cascade.empty() or self.eye_cascade.empty():
                raise Exception("Failed to load Haar cascades")
                
            self.is_initialized = True
            print("Eye detector initialized successfully with OpenCV")
            
        except Exception as e:
            raise Exception(f"Failed to initialize eye detector: {str(e)}")
            
    def detect_eyes(self, max_faces: int = 1) -> bool:
        """
        Detect if eyes are visible in the current frame
        
        Args:
            max_faces: Maximum number of faces to detect
            
        Returns:
            True if eyes are detected, False otherwise
        """
        if not self.is_initialized or not self.cap or not self.face_cascade or not self.eye_cascade:
            print("Eye detector not properly initialized")
            return False
            
        try:
            # Capture frame
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to read frame from camera")
                return False
                
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            if len(faces) == 0:
                return False
                
            # Process up to max_faces
            eyes_detected = False
            for i, (x, y, w, h) in enumerate(faces[:max_faces]):
                # Define face region
                face_gray = gray[y:y+h, x:x+w]
                face_color = frame[y:y+h, x:x+w]
                
                # Detect eyes within the face region
                eyes = self.eye_cascade.detectMultiScale(
                    face_gray,
                    scaleFactor=1.1,
                    minNeighbors=3,
                    minSize=(20, 20)
                )
                
                # Check if we found at least one eye
                if len(eyes) >= 1:
                    eyes_detected = True
                    break
                        
            return eyes_detected
            
        except Exception as e:
            print(f"Eye detection error: {e}")
            return False
    
    def is_camera_working(self) -> bool:
        """
        Check if the camera is still working properly
        
        Returns:
            True if camera is working, False otherwise
        """
        if not self.cap:
            return False
            
        try:
            # Try to read a frame
            ret, frame = self.cap.read()
            return ret and frame is not None
        except Exception:
            return False
            
    def detect_eyes_with_details(self, max_faces: int = 1) -> Tuple[bool, List[Tuple[int, int, int, int]]]:
        """
        Detect eyes and return detailed information
        
        Args:
            max_faces: Maximum number of faces to detect
            
        Returns:
            Tuple of (eyes_detected, list_of_eye_rectangles)
        """
        if not self.is_initialized or not self.cap or not self.face_cascade or not self.eye_cascade:
            return False, []
            
        try:
            # Capture frame
            ret, frame = self.cap.read()
            if not ret:
                return False, []
                
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            if len(faces) == 0:
                return False, []
                
            all_eyes = []
            eyes_detected = False
            
            # Process up to max_faces
            for i, (x, y, w, h) in enumerate(faces[:max_faces]):
                # Define face region
                face_gray = gray[y:y+h, x:x+w]
                
                # Detect eyes within the face region
                eyes = self.eye_cascade.detectMultiScale(
                    face_gray,
                    scaleFactor=1.1,
                    minNeighbors=3,
                    minSize=(20, 20)
                )
                
                # Convert eye coordinates back to full frame coordinates
                for (ex, ey, ew, eh) in eyes:
                    all_eyes.append((x + ex, y + ey, ew, eh))
                    eyes_detected = True
                        
            return eyes_detected, all_eyes
            
        except Exception as e:
            print(f"Eye detection error: {e}")
            return False, []
            
    def calculate_eye_aspect_ratio(self, eye_region: np.ndarray) -> float:
        """
        Calculate eye aspect ratio for a detected eye region
        
        Args:
            eye_region: Grayscale image of the eye region
            
        Returns:
            Eye aspect ratio
        """
        try:
            # Apply some preprocessing
            eye_region = cv2.GaussianBlur(eye_region, (5, 5), 0)
            
            # Find contours
            contours, _ = cv2.findContours(eye_region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return 0.0
                
            # Get the largest contour (should be the eye)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Calculate aspect ratio
            if h > 0:
                aspect_ratio = w / h
                return aspect_ratio
            else:
                return 0.0
                
        except Exception:
            return 0.0
        
    def get_camera_feed(self) -> Optional[np.ndarray]:
        """
        Get current camera frame for debugging/visualization
        
        Returns:
            Current frame as numpy array, or None if not available
        """
        if not self.cap:
            return None
            
        ret, frame = self.cap.read()
        if ret:
            return frame
        return None
        
    def get_face_detection_with_visualization(self) -> Optional[np.ndarray]:
        """
        Get current frame with face and eye detection visualization
        
        Returns:
            Frame with detection rectangles drawn, or None if not available
        """
        if not self.cap or not self.face_cascade or not self.eye_cascade:
            return None
            
        ret, frame = self.cap.read()
        if not ret:
            return None
            
        # Convert to grayscale for detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        # Draw face rectangles
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Detect eyes within face
            face_gray = gray[y:y+h, x:x+w]
            eyes = self.eye_cascade.detectMultiScale(
                face_gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(20, 20)
            )
            
            # Draw eye rectangles
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(frame, (x+ex, y+ey), (x+ex+ew, y+ey+eh), (0, 255, 0), 2)
                
        return frame
        
    def cleanup(self):
        """Clean up resources"""
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()
        self.is_initialized = False
        
    def __del__(self):
        """Destructor to ensure cleanup"""
        self.cleanup()