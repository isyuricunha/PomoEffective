# 🍅 YuPomo - Cross-Platform Pomodoro Timer

A beautiful, feature-rich Pomodoro timer built with React, TypeScript, Vite, and Tauri. Available as both a web application and native desktop app for Windows, macOS, and Linux.

## ✨ Features

- **🎯 Full Pomodoro Technique**: 25-min work sessions, 5-min short breaks, 15-min long breaks
- **🌙 Dark/Light Mode**: Beautiful themes with yellow accents in dark mode
- **⚙️ Customizable Settings**: Adjust timer durations, sound alerts, and notifications
- **📊 Productivity Statistics**: Track your progress with interactive charts
- **🔔 Smart Notifications**: Desktop and web notifications when sessions complete
- **🔊 Sound Alerts**: Audio feedback for session transitions
- **💾 Data Persistence**: Settings and statistics saved locally
- **📱 Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Quick Start

### Web Version
Visit the hosted web app: [Coming Soon - Deploy Link]

### Desktop Installation

#### Windows
1. Download the `.exe` installer from [Releases](releases)
2. Run the installer and follow the setup wizard
3. Launch YuPomo from your Start Menu

#### macOS
1. Download the `.dmg` file from [Releases](releases)
2. Open the DMG and drag YuPomo to Applications
3. Launch from Applications folder

#### Linux
1. Download the `.AppImage` file from [Releases](releases)
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
git clone https://github.com/yourusername/YuPomo.git
cd YuPomo/YuPomo

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
- **Styling**: TailwindCSS with custom themes
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the Pomodoro Technique by Francesco Cirillo
- Icons and emojis for beautiful UI
- Chart.js for data visualization
- Tauri for cross-platform desktop apps

## 📞 Support

- 🐛 [Report Issues](issues)
- 💡 [Request Features](issues/new)
- 📖 [Documentation](wiki)

---

**Made with ❤️ for productivity enthusiasts**
