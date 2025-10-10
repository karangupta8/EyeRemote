#!/usr/bin/env python3
"""
EyeRemote - Eye-controlled media player
Automatically pauses/resumes media playback based on user's gaze detection.
"""

import sys
import customtkinter as ctk
from tkinter import messagebox
import threading
import time
from datetime import datetime, timedelta
import cv2
import numpy as np
import pyautogui
import psutil
from .eye_detector import EyeDetector
from .config import Config

# Set appearance mode and color theme
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

class EyeRemoteApp:
    def __init__(self):
        self.root = ctk.CTk()
        self.root.title("EyeRemote - Eye-Controlled Media Player")
        self.root.geometry("700x600")
        self.root.resizable(True, True)
        
        # Initialize components
        self.config = Config()
        self.eye_detector = None
        self.detection_thread = None
        self.is_detecting = False
        self.last_eye_seen = None
        self.media_paused = False

        # State management for smoothing detection results
        self.eyes_detected_stable_state = False
        self.eyes_present_counter = 0
        self.no_eyes_counter = 0
        self.EYES_PRESENT_THRESHOLD = 2  # Frames to confirm eyes are present
        self.NO_EYES_THRESHOLD = 3       # Frames to confirm eyes are gone
        
        # Configure pyautogui
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.1
        
        self.setup_ui()
        self.load_config()
        
    def setup_ui(self):
        """Setup the modern user interface with CustomTkinter"""
        # Configure grid weights
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=1)
        
        # Main scrollable container
        main_container = ctk.CTkScrollableFrame(self.root, corner_radius=0, fg_color="transparent")
        main_container.grid(row=0, column=0, sticky="nsew")
        main_container.grid_columnconfigure(0, weight=1)
        
        # Title
        title_label = ctk.CTkLabel(main_container, text="EyeRemote", 
                                  font=ctk.CTkFont(size=28, weight="bold"))
        title_label.grid(row=0, column=0, pady=(20, 30))
        
        # Prominent Eye Detection Status Card
        self.status_card = ctk.CTkFrame(main_container, corner_radius=15, height=120)
        self.status_card.grid(row=1, column=0, sticky="ew", pady=(0, 20), padx=20)
        self.status_card.grid_columnconfigure(1, weight=1)
        self.status_card.grid_propagate(False)
        
        # Status icon and text
        self.status_icon = ctk.CTkLabel(self.status_card, text="👁️", font=ctk.CTkFont(size=36))
        self.status_icon.grid(row=0, column=0, padx=(30, 20), pady=20, sticky="w")
        
        self.eye_status_label = ctk.CTkLabel(self.status_card, text="NO EYES DETECTED", 
                                           font=ctk.CTkFont(size=24, weight="bold"))
        self.eye_status_label.grid(row=0, column=1, padx=(0, 30), pady=20, sticky="ew")
        
        # Initialize status card as not detected (red theme)
        self.update_status_card(False)
        
        # Detection status label
        self.status_var = ctk.StringVar(value="Stopped")
        self.status_label = ctk.CTkLabel(main_container, textvariable=self.status_var, 
                                        font=ctk.CTkFont(size=14))
        self.status_label.grid(row=2, column=0, pady=(0, 20))
        
        # Configuration frame
        config_frame = ctk.CTkFrame(main_container, corner_radius=10)
        config_frame.grid(row=3, column=0, sticky="ew", pady=(0, 20), padx=20)
        config_frame.grid_columnconfigure(1, weight=1)
        
        # Configuration title
        config_title = ctk.CTkLabel(config_frame, text="Configuration", 
                                   font=ctk.CTkFont(size=18, weight="bold"))
        config_title.grid(row=0, column=0, columnspan=2, pady=(20, 15), padx=20)
        
        # Timeout setting
        timeout_label = ctk.CTkLabel(config_frame, text="Attention Timeout (seconds):", 
                                    font=ctk.CTkFont(size=14))
        timeout_label.grid(row=1, column=0, sticky="w", pady=5, padx=(20, 10))
        
        self.timeout_var = ctk.StringVar(value="3")
        timeout_entry = ctk.CTkEntry(config_frame, textvariable=self.timeout_var, width=100, height=35)
        timeout_entry.grid(row=1, column=1, sticky="w", pady=5, padx=(0, 20))
        
        # Max faces setting
        faces_label = ctk.CTkLabel(config_frame, text="Max Faces to Monitor:", 
                                  font=ctk.CTkFont(size=14))
        faces_label.grid(row=2, column=0, sticky="w", pady=5, padx=(20, 10))
        
        self.max_faces_var = ctk.StringVar(value="1")
        faces_entry = ctk.CTkEntry(config_frame, textvariable=self.max_faces_var, width=100, height=35)
        faces_entry.grid(row=2, column=1, sticky="w", pady=5, padx=(0, 20))
        
        # Target application
        app_label = ctk.CTkLabel(config_frame, text="Target Application:", 
                                font=ctk.CTkFont(size=14))
        app_label.grid(row=3, column=0, sticky="w", pady=5, padx=(20, 10))
        
        self.target_app_var = ctk.StringVar(value="Any")
        target_combo = ctk.CTkComboBox(config_frame, values=["Any", "VLC", "Chrome", "Firefox", "Edge", "Netflix"],
                                      variable=self.target_app_var, width=150, height=35)
        target_combo.grid(row=3, column=1, sticky="w", pady=5, padx=(0, 20))
        
        # Bottom padding for config frame
        ctk.CTkLabel(config_frame, text="").grid(row=4, column=0, pady=(0, 20))
        
        # Control buttons frame
        button_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        button_frame.grid(row=4, column=0, pady=(0, 20))
        
        self.start_button = ctk.CTkButton(button_frame, text="Start Detection", 
                                         command=self.start_detection, height=40, width=150,
                                         font=ctk.CTkFont(size=14, weight="bold"))
        self.start_button.grid(row=0, column=0, padx=10)
        
        self.stop_button = ctk.CTkButton(button_frame, text="Stop Detection", 
                                        command=self.stop_detection, state="disabled", height=40, width=150,
                                        font=ctk.CTkFont(size=14, weight="bold"))
        self.stop_button.grid(row=0, column=1, padx=10)
        
        self.test_button = ctk.CTkButton(button_frame, text="Test Media Key", 
                                        command=self.test_media_key, height=40, width=150,
                                        font=ctk.CTkFont(size=14))
        self.test_button.grid(row=0, column=2, padx=10)
        
        # Activity log frame
        log_frame = ctk.CTkFrame(main_container, corner_radius=10)
        log_frame.grid(row=5, column=0, sticky="nsew", pady=(0, 20), padx=20)
        log_frame.grid_columnconfigure(0, weight=1)
        log_frame.grid_rowconfigure(1, weight=1)
        main_container.grid_rowconfigure(5, weight=1)
        
        # Log title
        log_title = ctk.CTkLabel(log_frame, text="Activity Log", 
                                font=ctk.CTkFont(size=16, weight="bold"))
        log_title.grid(row=0, column=0, pady=(15, 10), padx=20)
        
        # Log textbox
        self.log_text = ctk.CTkTextbox(log_frame, height=120, font=ctk.CTkFont(family="Consolas", size=12))
        self.log_text.grid(row=1, column=0, sticky="nsew", padx=20, pady=(0, 15))
        
        # About label
        about_label = ctk.CTkLabel(main_container, 
                                  text="EyeRemote v1.0 - Privacy-focused eye detection for media control", 
                                  font=ctk.CTkFont(size=10))
        about_label.grid(row=6, column=0, pady=(0, 20))
        
    def update_status_card(self, eyes_detected):
        """Update the prominent status card with eye detection state"""
        if eyes_detected:
            # Eyes detected - green theme
            self.status_card.configure(fg_color="#10B981")  # Green
            self.status_icon.configure(text="✅", text_color="white")
            self.eye_status_label.configure(text="EYES DETECTED", text_color="white")
        else:
            # No eyes detected - red theme
            self.status_card.configure(fg_color="#EF4444")  # Red
            self.status_icon.configure(text="❌", text_color="white")
            self.eye_status_label.configure(text="NO EYES DETECTED", text_color="white")
        
    def log_message(self, message):
        """Add message to log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        self.log_text.insert("end", log_entry)
        self.log_text.see("end")
        self.root.update_idletasks()
        
    def load_config(self):
        """Load saved configuration"""
        self.timeout_var.set(self.config.get('timeout', 3))
        self.max_faces_var.set(self.config.get('max_faces', 1))
        self.target_app_var.set(self.config.get('target_app', 'Any'))
        
    def save_config(self):
        """Save current configuration"""
        try:
            timeout = int(self.timeout_var.get())
            max_faces = int(self.max_faces_var.get())

            self.config.set('timeout', timeout)
            self.config.set('max_faces', max_faces)
            self.config.set('target_app', self.target_app_var.get())
            self.config.save()
            return True
        except (ValueError, TypeError):
            messagebox.showerror("Invalid Input", "Timeout and Max Faces must be valid numbers.")
            return False
        
    def start_detection(self):
        """Start eye detection"""
        if self.is_detecting:
            return
            
        if not self.save_config():
            return # Don't start if config is invalid

        self.is_detecting = True
        self.start_button.configure(state="disabled")
        self.stop_button.configure(state="normal")
        self.status_var.set("Starting...")
        self.log_message("Initializing camera and detector...")

        # Run detector initialization in a separate thread to avoid UI freeze
        self.detection_thread = threading.Thread(target=self._initialize_and_run_detector, daemon=True)
        self.detection_thread.start()

    def _initialize_and_run_detector(self):
        """Initializes the detector and then starts the detection loop."""
        try:
            # This is the long-running part
            self.eye_detector = EyeDetector(camera_index=self.config.get('camera_index', 0))
            
            # Once initialized, update state and start the main loop
            self.last_eye_seen = datetime.now()
            self.root.after(0, self.log_message, "Eye detection started")
            self.detection_loop()

        except Exception as e:
            # If initialization fails, update UI back on the main thread
            def update_ui_on_error():
                messagebox.showerror("Error", f"Failed to start detection: {str(e)}")
                self.is_detecting = False
                self.start_button.configure(state="normal")
                self.stop_button.configure(state="disabled")
                self.status_var.set("Error")
                self.log_message(f"Initialization failed: {e}")
            self.root.after(0, update_ui_on_error)
            
    def stop_detection(self):
        """Stop eye detection"""
        self.is_detecting = False
        
        if self.eye_detector:
            self.eye_detector.cleanup()
            self.eye_detector = None
            
        # Update UI
        self.start_button.configure(state="normal")
        self.stop_button.configure(state="disabled")
        self.status_var.set("Stopped")

        # Reset detection state
        self.eyes_detected_stable_state = False
        self.eyes_present_counter = 0
        self.no_eyes_counter = 0

        self.update_status_card(False)
        
        self.log_message("Eye detection stopped")
        
    def detection_loop(self):
        """Main detection loop"""
        try:
            timeout_seconds = int(self.timeout_var.get())
        except (ValueError, TypeError):
            timeout_seconds = 3 # Fallback to default
            self.log_message("Invalid timeout value, using default 3s.")
        timeout_duration = timedelta(seconds=timeout_seconds)
        
        while self.is_detecting:
            try:
                if not self.eye_detector:
                    break
                    
                # Detect eyes
                eyes_detected = self.eye_detector.detect_eyes()
                current_time = datetime.now()

                # --- State smoothing logic ---
                if eyes_detected:
                    self.no_eyes_counter = 0
                    self.eyes_present_counter += 1
                    if self.eyes_present_counter >= self.EYES_PRESENT_THRESHOLD and not self.eyes_detected_stable_state:
                        self.eyes_detected_stable_state = True
                        self.root.after(0, self.update_status_card, True)
                else:
                    self.eyes_present_counter = 0
                    self.no_eyes_counter += 1
                    if self.no_eyes_counter >= self.NO_EYES_THRESHOLD and self.eyes_detected_stable_state:
                        self.eyes_detected_stable_state = False
                        self.root.after(0, self.update_status_card, False)

                # --- Media control logic based on stable state ---
                if self.eyes_detected_stable_state:
                    self.last_eye_seen = current_time

                    # If media was paused, resume it
                    if self.media_paused:
                        # Check if the target app is active before resuming
                        if self.is_target_app_active():
                            self.send_media_key_event()
                            self.media_paused = False
                            self.log_message("Media resumed - eyes detected")
                else:
                    # If eyes are not detected, check if we need to pause
                    if not self.media_paused and self.last_eye_seen and (current_time - self.last_eye_seen > timeout_duration):
                        # Check if the target app is active before pausing
                        if self.is_target_app_active():
                            self.send_media_key_event()
                            self.media_paused = True
                            self.log_message(f"Media paused - eyes not detected for {timeout_seconds}s")
                
                # Update status
                self.status_var.set("Detecting")
                
                time.sleep(0.1)  # Small delay to prevent excessive CPU usage
                
            except Exception as e:
                self.log_message(f"Detection error: {str(e)}")
                time.sleep(1)
                
    def _execute_send_media_key(self, is_test=False):
        """Finds the target app, focuses it, and sends a media play/pause keypress."""
        target_app = self.target_app_var.get().lower()

        if target_app != "any":
            if not self._focus_target_app(target_app, is_test):
                return  # Stop if we couldn't find or focus the app

        self.log_message(f"Sending Media Play/Pause key (Target: {self.target_app_var.get()})")
        # Pass the target_hwnd to the send function for direct messaging on Windows
        self._send_keypress_with_fallback(getattr(self, '_last_focused_hwnd', None))

    def _send_keypress_with_fallback(self, target_hwnd=None):
        """Sends a media play/pause key using the most reliable method available."""
        # On Windows, if we have a specific window handle, use PostMessage for reliability.
        if sys.platform == "win32" and target_hwnd:
            try:
                import win32api
                # Define constants manually in case they are not in all pywin32 versions
                WM_APPCOMMAND = 0x0319
                APPCOMMAND_MEDIA_PLAY_PAUSE = 14

                # The command must be packed into the lParam
                lparam = APPCOMMAND_MEDIA_PLAY_PAUSE << 16

                win32api.PostMessage(target_hwnd, WM_APPCOMMAND, 0, lparam)
                time.sleep(0.05) # Small delay between key down and up
                self.log_message(f"win32 PostMessage: Media key sent directly to window handle {target_hwnd}.")
                return
            except Exception as e:
                self.log_message(f"win32 PostMessage failed: {e}. Falling back to pyautogui.")

        # Fallback for other OS or if PostMessage fails
        try:
            pyautogui.press('playpause')
            self.log_message("pyautogui: Media Play/Pause key sent successfully.")
        except Exception as e1:
            self.log_message(f"pyautogui failed: {str(e1)}. Trying fallback...")
            try:
                from pynput.keyboard import Key, Controller
                keyboard = Controller()
                keyboard.press(Key.media_play_pause)
                keyboard.release(Key.media_play_pause)
                self.log_message("pynput fallback: Media key sent successfully.")
            except Exception as e2:
                self.log_message(f"pynput fallback failed: {str(e2)}")
                messagebox.showwarning("Input Error", "Failed to send media key. Please check OS permissions for accessibility/input monitoring.")

    def send_media_key_event(self, delay_seconds=0):
        """
        Schedules a media play/pause keypress.
        A delay is used for testing to allow window focus to change.
        """
        if delay_seconds > 0:
            self.log_message(f"Test: Sending media key in {delay_seconds} seconds...")
            self.root.after(int(delay_seconds * 1000), lambda: self._execute_send_media_key(is_test=True))
        else:
            # For automatic detection, execute immediately.
            self._execute_send_media_key(is_test=False)

    def _focus_target_app(self, target_app_name, is_test):
        """Find and focus the window of the target application."""
        self.log_message(f"Attempting to focus '{target_app_name}'...")
        self._last_focused_hwnd = None # Reset the handle

        # Find the process ID (PID) of the target application
        target_pid = None
        for proc in psutil.process_iter(['pid', 'name']):
            if target_app_name in proc.info['name'].lower():
                target_pid = proc.info['pid']
                break

        if not target_pid:
            self.log_message(f"Application '{target_app_name}' is not running.")
            if is_test:
                messagebox.showwarning("App Not Found", f"The application '{target_app_name}' does not appear to be running.")
            return False

        # Platform-specific window activation
        try:
            if sys.platform == "win32":
                # Retry the entire find-and-focus logic to handle initialization race conditions.
                for attempt in range(2):
                    try:
                        import win32gui
                        import win32com.client
                        import win32process

                        target_hwnd = None

                        def enum_windows_callback(hwnd, _):
                            nonlocal target_hwnd
                            if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
                                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                                try:
                                    proc = psutil.Process(pid)
                                    if target_app_name in proc.name().lower():
                                        target_hwnd = hwnd
                                        return False
                                except (psutil.NoSuchProcess, psutil.AccessDenied):
                                    pass
                            return True

                        win32gui.EnumWindows(enum_windows_callback, None)

                        if target_hwnd:
                            self._last_focused_hwnd = target_hwnd
                            shell = win32com.client.Dispatch("WScript.Shell")
                            shell.AppActivate(target_hwnd)
                            self.log_message(f"Focused '{target_app_name}' on attempt {attempt + 1}.")
                            break # Success, exit the retry loop
                        elif attempt == 0: # If no window found on first try
                            self.log_message(f"Could not find window for '{target_app_name}' on attempt 1. Retrying...")
                            time.sleep(0.5)
                        else: # If no window found on second try
                            self.log_message(f"Could not find a visible window for '{target_app_name}' after 2 attempts.")
                            return False
                    except Exception as e:
                        if attempt == 0:
                            self.log_message(f"Focus attempt 1 failed with error: {e}. Retrying...")
                            time.sleep(0.5)
                        else:
                            # If the second attempt also fails, re-raise the exception to be caught outside
                            raise e
                else: # This 'else' belongs to the for loop, executes if 'break' is not hit
                    self.log_message("All focus attempts failed.")
                    return False
                
                # If we broke out of the loop, it was a success.
                time.sleep(0.2) # Give OS a moment to process the focus change.
                return True

            elif sys.platform == "darwin": # macOS
                from AppKit import NSWorkspace, NSRunningApplication
                app = NSRunningApplication.runningApplicationWithProcessIdentifier_(target_pid)
                if app:
                    app.activateWithOptions_(0) # NSApplicationActivateIgnoringOtherApps
                    self.log_message(f"Activated '{target_app_name}' (PID: {target_pid}).")
                    time.sleep(0.2) # Give OS a moment to process the focus change.
                    return True
                return False

            elif sys.platform == "linux":
                # This requires 'xdotool' to be installed (sudo apt-get install xdotool)
                import subprocess
                # Find window ID from PID and activate it
                cmd = f"xdotool search --pid {target_pid} windowactivate"
                subprocess.run(cmd, shell=True, check=True, capture_output=True)
                self.log_message(f"Activated '{target_app_name}' window (PID: {target_pid}).")
                time.sleep(0.2)
                return True

        except (ImportError, Exception) as e:
            self.log_message(f"Error focusing application: {e}")
            if is_test:
                messagebox.showwarning("Focus Error", f"Could not focus '{target_app_name}'. Please ensure required libraries (e.g., pywin32, xdotool) are installed.")
            return False # Fallback to prevent sending keypress to wrong window

    def is_target_app_active(self):
        """Check if target application is currently active"""
        target_app = self.target_app_var.get().lower()

        # If "Any" is selected, we don't filter by application, so it's always considered active.
        if target_app == "any":
            return True

        active_process_name = ""

        try:
            if sys.platform == "win32":
                import win32gui
                import win32process

                hwnd = win32gui.GetForegroundWindow()
                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                active_process_name = psutil.Process(pid).name().lower()

            elif sys.platform == "darwin": # macOS
                from AppKit import NSWorkspace
                active_app = NSWorkspace.sharedWorkspace().frontmostApplication()
                active_process_name = active_app.localizedName().lower()

            elif sys.platform == "linux":
                # This requires 'xdotool' to be installed (sudo apt-get install xdotool)
                try:
                    import subprocess
                    cmd = 'xdotool getactivewindow getwindowname'
                    # First, try to get the process name via PID
                    cmd_pid = 'xdotool getactivewindow getwindowpid'
                    pid = int(subprocess.check_output(cmd_pid, shell=True, text=True).strip())
                    active_process_name = psutil.Process(pid).name().lower()
                except (FileNotFoundError, subprocess.CalledProcessError):
                    # Fallback to window title if xdotool or process lookup fails
                    cmd = 'xdotool getactivewindow getwindowname'
                    active_process_name = subprocess.check_output(cmd, shell=True, text=True).lower()
                except (FileNotFoundError, subprocess.CalledProcessError):
                    self.log_message("is_target_app_active: 'xdotool' not found on Linux. Falling back to allow.")
                    return True # Fallback if xdotool is not installed
            else:
                # For other OS, assume it's okay
                return True

            if active_process_name:
                self.log_message(f"Active window process: '{active_process_name}'")
                if target_app in active_process_name:
                    return True # Target app found in active process name

            return False # Target app is not "any" and not the active process

        except Exception as e:
            self.log_message(f"Could not check active app: {e}")
            return True  # If we can't check, assume it's okay

    def test_media_key(self):
        """Test media key functionality"""
        self.send_media_key_event(delay_seconds=3)
        
    def on_closing(self):
        """Handle application closing"""
        if self.is_detecting:
            self.stop_detection()
        self.root.destroy()
        
    def run(self):
        """Run the application"""
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.root.mainloop()

if __name__ == "__main__":
    try:
        app = EyeRemoteApp()
        app.run()
    except Exception as e:
        print(f"Application error: {e}")
        sys.exit(1)
