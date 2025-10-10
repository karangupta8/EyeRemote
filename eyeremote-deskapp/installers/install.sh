#!/bin/bash

echo "EyeRemote Installation"
echo "====================="
echo

echo "Installing Python dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

echo
echo "Downloading facial landmarks predictor..."
python3 models/download_models.py

echo
echo "Creating desktop entry..."
cat > ~/.local/share/applications/eyeremote.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=EyeRemote
Comment=Eye-controlled media player
Exec=python3 $(pwd)/eyeremote.py
Icon=applications-multimedia
Terminal=false
Categories=AudioVideo;Player;
EOF

chmod +x ~/.local/share/applications/eyeremote.desktop

echo
echo "====================="
echo "Installation completed!"
echo
echo "To run EyeRemote:"
echo "  1. Find EyeRemote in your applications menu, OR"
echo "  2. Run: python3 main.py"
echo
echo "Make sure your webcam is connected and not used by other applications."
echo
