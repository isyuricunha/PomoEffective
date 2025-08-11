# YuPomo - A Modern Pomodoro Timer

YuPomo is a lightweight, cross-platform Pomodoro timer application built with the Godot engine. It features a beautiful dark orange theme with modern UI design and essential productivity features.

## Current Status

The project has been updated for **Godot 4.4.1** compatibility. The main issues that were causing loading errors have been resolved:

- ✅ Updated from deprecated `WindowDialog` to `Window` nodes
- ✅ Fixed UID conflicts between scenes
- ✅ Fixed resource ID conflicts
- ✅ Updated project configuration for Godot 4.4

## Testing the Project

### Quick Test (Recommended First)
1. Open the project in Godot 4.4.1
2. The project will load with `TestScene.tscn` as the main scene
3. Press F5 or click the play button
4. You should see "Test Scene Works!" displayed

### Test the Main Application
1. In the project settings, change the main scene back to `scenes/Main.tscn`
2. Run the project
3. The Pomodoro timer should load with the dark orange theme

## Features

### Core Timer Functionality
- **Pomodoro Timer**: 25-minute focus sessions (configurable)
- **Short Breaks**: 5-minute breaks between focus sessions (configurable)
- **Long Breaks**: 15-minute breaks after 4 completed pomodoros (configurable)
- **Auto-transition**: Seamlessly moves between focus and break phases

### User Interface
- **Modern Dark Theme**: Pure dark background with orange accents
- **Rounded Corners**: Clean, modern design throughout the interface
- **Responsive Layout**: Adapts to different window sizes
- **Progress Bar**: Visual representation of current session progress

### Controls
- **Start/Pause/Resume**: Single button for timer control
- **Reset**: Reset current session to beginning
- **Skip Break**: Option to skip break and start next focus session

### Additional Features
- **Task Labeling**: Optional task description for each session
- **Sound Notifications**: Audio alerts when sessions complete
- **System Notifications**: Desktop notifications for session completion
- **Settings Menu**: Customizable timer durations and preferences

## Building from Source

### Prerequisites
1. **Godot Engine**: Download and install Godot 4.4.1+ from [godotengine.org](https://godotengine.org/)
2. **Git**: For cloning the repository

### Build Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/YuPomo.git
   cd YuPomo
   ```

2. **Open in Godot**:
   - Launch Godot Engine 4.4.1+
   - Click "Import" and select the `project.godot` file
   - Click "Import & Edit"

3. **Test the project**:
   - Press F5 to run the test scene
   - Switch to Main scene and test the timer functionality

4. **Build for your platform**:
   - Go to `Project` → `Export`
   - Add export presets for your target platforms

## Project Structure

```
YuPomo/
├── scenes/                    # Scene files
│   ├── Main.tscn            # Main application scene
│   ├── SettingsDialog.tscn  # Settings dialog scene
│   └── TestScene.tscn       # Test scene for debugging
├── scripts/                  # GDScript files
│   ├── Main.gd              # Main application logic
│   ├── SettingsDialog.gd    # Settings management
│   └── TestScript.gd        # Test script
├── themes/                   # Theme resources
│   └── DarkOrangeTheme.tres # Custom dark orange theme
├── assets/                   # Media assets
├── project.godot            # Godot project configuration
└── README.md                # This file
```

## Troubleshooting

### Common Issues

1. **Scene Loading Errors**: Make sure you're using Godot 4.4.1+
2. **Resource Conflicts**: The UID conflicts have been resolved
3. **Window Dialog Issues**: Updated to use `Window` instead of deprecated `WindowDialog`

### If You Still Get Errors
1. Delete the `.godot` folder and reimport the project
2. Make sure all scene files have unique UIDs
3. Check that resource references are correct

## Next Steps

Once the basic functionality is working:
1. Test the settings dialog
2. Add actual sound files
3. Implement system notifications
4. Add additional theme variants

## License

This project is licensed under the MIT License.

---

**YuPomo** - Built with ❤️ using Godot Engine 4.4
*Focus • Break • Repeat*
