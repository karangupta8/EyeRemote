<#
.SYNOPSIS
    Automates the packaging of the EyeRemote Chrome Extension.
.DESCRIPTION
    This script performs the following actions:
    1. Ensures MediaPipe assets are downloaded by running 'download_mediapipe.ps1'.
    2. Locates the Google Chrome executable.
    3. Uses Chrome's command-line interface to package the extension into a .crx file.
    4. Uses the existing private key ('eyeremote-chromeext.pem') for consistent extension IDs.
.OUTPUTS
    Creates 'eyeremote-chromeext.crx' in the parent directory 'd:\ProjStuff\EyeRemote\'.
#>

# --- Configuration ---
# Define paths relative to the script's location.
$ScriptDir = $PSScriptRoot
$ExtensionSourceDir = $ScriptDir
$ProjectRootDir = Split-Path -Path $ScriptDir -Parent
$PrivateKeyFile = Join-Path -Path $ProjectRootDir -ChildPath "eyeremote-chromeext.pem"

# --- Step 1: Ensure MediaPipe assets are downloaded ---
$DownloaderScript = Join-Path -Path $ScriptDir -ChildPath "download_mediapipe.ps1"
if (Test-Path $DownloaderScript) {
    Write-Host "Ensuring MediaPipe assets are up-to-date..."
    # Temporarily change location to run the script, as it might use relative paths internally.
    Push-Location $ScriptDir
    try {
        & $DownloaderScript
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Warning "Could not find 'download_mediapipe.ps1'. Skipping asset download. Packaging may fail if assets are missing."
}

# --- Step 2: Find Chrome executable ---
Write-Host "Locating Google Chrome..."
$chromePath = ""
$possiblePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if (-not $chromePath) {
    Write-Error "Google Chrome could not be found. Please update the script with the correct path to chrome.exe."
    exit 1
}

# --- Step 3: Package the extension ---
Write-Host "Packaging the extension..."
$arguments = "--pack-extension=`"$ExtensionSourceDir`" --pack-extension-key=`"$PrivateKeyFile`""

Start-Process -FilePath $chromePath -ArgumentList $arguments -Wait

Write-Host -ForegroundColor Green "Build complete! The file 'eyeremote-chromeext.crx' has been created in '$ProjectRootDir'."