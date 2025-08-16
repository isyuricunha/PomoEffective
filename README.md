# 🍅 YuPomo – Boost productivity, one cycle at a time.

A beautiful, minimalist Pomodoro timer built with React, TypeScript, Vite, and Tauri. Available as a web app and native desktop app for Windows, macOS, and Linux.

![GitHub release (latest by date)](https://img.shields.io/github/v/release/isyuricunha/YuPomo)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/isyuricunha/YuPomo)
![License](https://img.shields.io/github/license/isyuricunha/YuPomo)

## ✨ Features

- **🎯 Full Pomodoro Technique**: 25-min work sessions, 5-min short breaks, 15-min long breaks
- **🌙 Dark/Light Mode**: True black + amber in dark mode, clean and minimal in light
- **⚙️ Customizable Settings**: Adjust timer durations, sound alerts, and notifications
- **📊 Productivity Statistics**: Track your progress with interactive charts
- **🔔 Smart Notifications**: Desktop and web notifications when sessions complete
- **🔊 Sound Alerts**: Audio feedback for session transitions
- **💾 Data Persistence**: Settings and statistics saved locally
- **📱 Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Quick Start

### Web Version
Visit the hosted web app: [Coming Soon]

### Desktop Installation

#### Windows
1. Download the `.exe` installer from [Releases](https://github.com/isyuricunha/YuPomo/releases)
2. Run the installer and follow the setup wizard
3. Launch YuPomo from your Start Menu

#### macOS
1. Download the `.dmg` file from [Releases](https://github.com/isyuricunha/YuPomo/releases)
2. Open the DMG and drag YuPomo to Applications
3. Launch from Applications folder

#### Linux
1. Download the `.AppImage` file from [Releases](https://github.com/isyuricunha/YuPomo/releases)
2. Make it executable: `chmod +x YuPomo.AppImage`
3. Run: `./YuPomo.AppImage`

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- Rust (for Tauri desktop builds)
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/isyuricunha/YuPomo.git
cd YuPomo

# Install dependencies
npm install

# Run web development server
npm run dev

# Run desktop development (Tauri)
npm run tauri dev
```

### Building

#### Web Build
```bash
# Build for web deployment
npm run build

# Preview production build
npm run preview
```

#### Desktop Build
```bash
# Build desktop app for current platform
npm run tauri build

# Generated files will be in src-tauri/target/release/bundle/
```

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom themes (true black dark theme)
- **Charts**: Chart.js + react-chartjs-2
- **Desktop**: Tauri (Rust backend)
- **Storage**: localStorage (web) + Tauri filesystem (desktop)
- **Notifications**: Web Notification API + Tauri notifications

## 🎨 Screenshots

### Light Mode
![Light Mode Timer](screenshots/light-mode.png)

### Dark Mode with Statistics
![Dark Mode Statistics](screenshots/dark-stats.png)

### Settings Panel
![Settings](screenshots/settings.png)

## 🔧 Configuration

### Timer Settings
- Work session: 1-60 minutes (default: 25)
- Short break: 1-30 minutes (default: 5)  
- Long break: 1-60 minutes (default: 15)

### Notifications
- Desktop notifications for session completion
- Sound alerts with customizable volume
- Visual progress indicators

## 📈 Statistics

Track your productivity with:
- Daily work session counts
- Weekly and monthly trends
- Total focus time calculations
- Session type distribution
- Productivity insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the Pomodoro Technique by Francesco Cirillo
- Icons and emojis for beautiful UI
- Chart.js for data visualization
- Tauri for cross-platform desktop apps

## 📞 Support

- 🐛 [Report Issues](https://github.com/isyuricunha/YuPomo/issues)
- 💡 [Request Features](https://github.com/isyuricunha/YuPomo/issues/new)
- 📖 [Documentation](https://github.com/isyuricunha/YuPomo/wiki)

---

**Made with ❤️ for productivity enthusiasts**
