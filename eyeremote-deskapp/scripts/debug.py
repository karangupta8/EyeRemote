"""
Debug utilities for EyeRemote application
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import numpy as np
import tkinter as tk
from tkinter import ttk
import threading
import time
from app.eye_detector import EyeDetector

class DebugWindow:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("EyeRemote Debug - Camera Feed")
        self.root.geometry("800x600")
        
        self.eye_detector = None
        self.is_running = False
        self.debug_thread = None
        
        self.setup_ui()
        
    def setup_ui(self):
        """Setup debug interface"""
        # Control frame
        control_frame = ttk.Frame(self.root)
        control_frame.pack(pady=10)
        
        self.start_button = ttk.Button(control_frame, text="Start Camera", command=self.start_camera)
        self.start_button.pack(side=tk.LEFT, padx=5)
        
        self.stop_button = ttk.Button(control_frame, text="Stop Camera", command=self.stop_camera, state="disabled")
        self.stop_button.pack(side=tk.LEFT, padx=5)
        
        # Status frame
        status_frame = ttk.LabelFrame(self.root, text="Detection Status", padding="10")
        status_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.faces_label = ttk.Label(status_frame, text="Faces detected: 0")
        self.faces_label.pack()
        
        self.eyes_label = ttk.Label(status_frame, text="Eyes detected: No")
        self.eyes_label.pack()
        
        self.fps_label = ttk.Label(status_frame, text="FPS: 0")
        self.fps_label.pack()
        
        # Video frame
        self.video_label = ttk.Label(self.root, text="Camera feed will appear here")
        self.video_label.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)
        
    def start_camera(self):
        """Start camera debug feed"""
        if self.is_running:
            return
            
        try:
            self.eye_detector = EyeDetector()
            self.is_running = True
            
            self.start_button.config(state="disabled")
            self.stop_button.config(state="normal")
            
            self.debug_thread = threading.Thread(target=self.debug_loop, daemon=True)
            self.debug_thread.start()
            
        except Exception as e:
            tk.messagebox.showerror("Error", f"Failed to start camera: {str(e)}")
            
    def stop_camera(self):
        """Stop camera debug feed"""
        self.is_running = False
        
        if self.eye_detector:
            self.eye_detector.cleanup()
            self.eye_detector = None
            
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")
        
        self.video_label.config(image="", text="Camera stopped")
        
    def debug_loop(self):
        """Main debug loop with video feed"""
        fps_counter = 0
        fps_start_time = time.time()
        
        while self.is_running:
            try:
                if not self.eye_detector or not self.eye_detector.cap:
                    break
                    
                # Capture frame
                ret, frame = self.eye_detector.cap.read()
                if not ret:
                    continue
                    
                # Convert to grayscale for face detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Detect faces
                faces = self.eye_detector.detector(gray)
                
                # Draw face rectangles
                for face in faces:
                    x, y, w, h = face.left(), face.top(), face.width(), face.height()
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    
                    # Detect eyes if predictor is available
                    if self.eye_detector.predictor:
                        landmarks = self.eye_detector.predictor(gray, face)
                        
                        # Draw eye landmarks
                        for i in range(36, 48):  # Eye landmark indices
                            point = landmarks.part(i)
                            cv2.circle(frame, (point.x, point.y), 2, (255, 0, 0), -1)
                            
                        # Check if eyes are open
                        left_eye_points = self.eye_detector._get_eye_points(landmarks, "left")
                        right_eye_points = self.eye_detector._get_eye_points(landmarks, "right")
                        
                        left_ear = self.eye_detector._calculate_eye_aspect_ratio(left_eye_points)
                        right_ear = self.eye_detector._calculate_eye_aspect_ratio(right_eye_points)
                        
                        avg_ear = (left_ear + right_ear) / 2.0
                        
                        # Draw EAR value
                        cv2.putText(frame, f"EAR: {avg_ear:.3f}", (x, y - 10), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
                # Update status
                self.root.after(0, self.update_status, len(faces), len(faces) > 0)
                
                # Convert frame for display
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_pil = Image.fromarray(frame_rgb)
                
                # Resize for display
                display_width = 640
                display_height = 480
                frame_pil = frame_pil.resize((display_width, display_height), Image.Resampling.LANCZOS)
                
                # Convert to PhotoImage
                frame_tk = ImageTk.PhotoImage(frame_pil)
                
                # Update display
                self.root.after(0, self.update_video, frame_tk)
                
                # Calculate FPS
                fps_counter += 1
                if fps_counter % 30 == 0:  # Update FPS every 30 frames
                    fps_elapsed = time.time() - fps_start_time
                    fps = 30 / fps_elapsed if fps_elapsed > 0 else 0
                    self.root.after(0, self.update_fps, fps)
                    fps_counter = 0
                    fps_start_time = time.time()
                
                time.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                print(f"Debug loop error: {e}")
                time.sleep(1)
                
    def update_status(self, face_count: int, eyes_detected: bool):
        """Update status labels"""
        self.faces_label.config(text=f"Faces detected: {face_count}")
        self.eyes_label.config(text=f"Eyes detected: {'Yes' if eyes_detected else 'No'}")
        
    def update_fps(self, fps: float):
        """Update FPS label"""
        self.fps_label.config(text=f"FPS: {fps:.1f}")
        
    def update_video(self, frame_tk):
        """Update video display"""
        self.video_label.config(image=frame_tk)
        self.video_label.image = frame_tk  # Keep a reference
        
    def run(self):
        """Run debug window"""
        self.root.mainloop()

def main():
    """Run debug application"""
    try:
        from PIL import Image, ImageTk
        debug_app = DebugWindow()
        debug_app.run()
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Install Pillow with: pip install Pillow")
    except Exception as e:
        print(f"Debug application error: {e}")

if __name__ == "__main__":
    main()
