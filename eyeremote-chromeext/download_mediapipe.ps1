# PowerShell script to download MediaPipe assets for offline use
# Run this script from the eyeremote-chromeext directory

Write-Host "Downloading MediaPipe assets..."

# Create lib directory structure if it doesn't exist
if (!(Test-Path "lib\wasm")) {
    New-Item -ItemType Directory -Path "lib\wasm" -Force
}

# Download MediaPipe Vision Tasks JS file
$visionTasksUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_tasks.js"
Write-Host "Downloading vision_tasks.js..."
Invoke-WebRequest -Uri $visionTasksUrl -OutFile "lib\vision_tasks.js"

# Download WASM files
$wasmInternalUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_internal.js"
Write-Host "Downloading vision_wasm_internal.js..."
Invoke-WebRequest -Uri $wasmInternalUrl -OutFile "lib\wasm\vision_wasm_internal.js"

$wasmBinaryUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_internal.wasm"
Write-Host "Downloading vision_wasm_internal.wasm..."
Invoke-WebRequest -Uri $wasmBinaryUrl -OutFile "lib\wasm\vision_wasm_internal.wasm"

# Download Face Landmarker model
$modelUrl = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
Write-Host "Downloading face_landmarker.task..."
Invoke-WebRequest -Uri $modelUrl -OutFile "lib\face_landmarker.task"

Write-Host "MediaPipe assets downloaded successfully!"
Write-Host "Files downloaded:"
Write-Host "- lib\vision_tasks.js"
Write-Host "- lib\wasm\vision_wasm_internal.js"
Write-Host "- lib\wasm\vision_wasm_internal.wasm"
Write-Host "- lib\face_landmarker.task"
