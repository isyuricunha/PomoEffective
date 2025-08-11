@echo off
echo YuPomo Build Script for Windows
echo ================================
echo.

REM Check if Godot is in PATH or common locations
set GODOT_PATH=

REM Try to find Godot executable
where godot >nul 2>nul
if %errorlevel% == 0 (
    set GODOT_PATH=godot
    echo Found Godot in PATH
) else (
    if exist "C:\Program Files\Godot\Godot_v4.2.1-stable_win64.exe" (
        set GODOT_PATH="C:\Program Files\Godot\Godot_v4.2.1-stable_win64.exe"
        echo Found Godot in Program Files
    ) else if exist "%USERPROFILE%\AppData\Local\Programs\Godot\Godot_v4.2.1-stable_win64.exe" (
        set GODOT_PATH="%USERPROFILE%\AppData\Local\Programs\Godot\Godot_v4.2.1-stable_win64.exe"
        echo Found Godot in AppData
    ) else (
        echo Godot not found in common locations
        echo Please install Godot 4.2+ and add it to PATH
        echo Download from: https://godotengine.org/download/windows/
        pause
        exit /b 1
    )
)

echo.
echo Building YuPomo...
echo.

REM Create builds directory
if not exist "builds" mkdir builds

REM Build for Windows
echo Building for Windows...
%GODOT_PATH% --headless --export "Windows Desktop" "builds\YuPomo-Windows.exe"
if %errorlevel% == 0 (
    echo Windows build completed successfully!
) else (
    echo Windows build failed!
)

REM Build for Web
echo.
echo Building for Web...
%GODOT_PATH% --headless --export "HTML5" "builds\YuPomo-Web\index.html"
if %errorlevel% == 0 (
    echo Web build completed successfully!
) else (
    echo Web build failed!
)

echo.
echo Build process completed!
echo Check the builds\ directory for your executables.
echo.
pause
