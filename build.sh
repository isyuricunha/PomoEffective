#!/bin/bash

echo "YuPomo Build Script for Unix Systems"
echo "===================================="
echo

# Check if Godot is in PATH or common locations
GODOT_PATH=""

# Try to find Godot executable
if command -v godot >/dev/null 2>&1; then
    GODOT_PATH="godot"
    echo "Found Godot in PATH"
elif [ -f "/usr/bin/godot" ]; then
    GODOT_PATH="/usr/bin/godot"
    echo "Found Godot in /usr/bin"
elif [ -f "/usr/local/bin/godot" ]; then
    GODOT_PATH="/usr/local/bin/godot"
    echo "Found Godot in /usr/local/bin"
elif [ -f "$HOME/.local/bin/godot" ]; then
    GODOT_PATH="$HOME/.local/bin/godot"
    echo "Found Godot in ~/.local/bin"
else
    echo "Godot not found in common locations"
    echo "Please install Godot 4.2+ and add it to PATH"
    echo "Download from: https://godotengine.org/download/"
    exit 1
fi

echo
echo "Building YuPomo..."
echo

# Create builds directory
mkdir -p builds

# Build for Linux
echo "Building for Linux..."
$GODOT_PATH --headless --export "Linux/X11" "builds/YuPomo-Linux.x86_64"
if [ $? -eq 0 ]; then
    echo "Linux build completed successfully!"
else
    echo "Linux build failed!"
fi

# Build for Web
echo
echo "Building for Web..."
$GODOT_PATH --headless --export "HTML5" "builds/YuPomo-Web/index.html"
if [ $? -eq 0 ]; then
    echo "Web build completed successfully!"
else
    echo "Web build failed!"
fi

# Make Linux executable executable
if [ -f "builds/YuPomo-Linux.x86_64" ]; then
    chmod +x "builds/YuPomo-Linux.x86_64"
    echo "Made Linux executable executable"
fi

echo
echo "Build process completed!"
echo "Check the builds/ directory for your executables."
echo
