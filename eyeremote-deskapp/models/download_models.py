#!/usr/bin/env python3
"""
Download required model files for EyeRemote
Downloads the facial landmarks predictor file needed for eye detection
"""

import os
import urllib.request
import bz2
import sys

def download_facial_landmarks():
    """Download the required facial landmarks predictor file"""
    landmarks_file = "shape_predictor_68_face_landmarks.dat"
    
    if os.path.exists(landmarks_file):
        print(f"✓ {landmarks_file} already exists")
        return True
        
    print("Downloading facial landmarks predictor...")
    print("This may take a few minutes...")
    
    url = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
    
    try:
        print(f"Downloading from: {url}")
        urllib.request.urlretrieve(url, f"{landmarks_file}.bz2")
        
        print("Extracting compressed file...")
        with bz2.BZ2File(f"{landmarks_file}.bz2", 'rb') as source:
            with open(landmarks_file, 'wb') as target:
                target.write(source.read())
                
        # Clean up the bz2 file
        os.remove(f"{landmarks_file}.bz2")
        
        file_size = os.path.getsize(landmarks_file)
        print(f"✓ {landmarks_file} downloaded successfully ({file_size:,} bytes)")
        return True
        
    except Exception as e:
        print(f"✗ Failed to download {landmarks_file}: {e}")
        print("\nManual download instructions:")
        print(f"1. Go to: {url}")
        print("2. Download the file")
        print("3. Extract it using 7-Zip, WinRAR, or similar")
        print(f"4. Place the extracted file as: {landmarks_file}")
        return False

def main():
    """Main function"""
    print("EyeRemote Model Downloader")
    print("=" * 40)
    
    success = download_facial_landmarks()
    
    if success:
        print("\n✓ Model download completed successfully!")
        print("EyeRemote should now work with full eye detection accuracy.")
    else:
        print("\n⚠ Model download failed.")
        print("EyeRemote will still work with basic face detection.")
        print("For better accuracy, download the model manually.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
