# PomoEffective

A modern, effective Pomodoro timer built with Electron, featuring internationalization support and a beautiful rounded UI design.

## Features

- ⏱️ **Pomodoro Timer**: Customizable work and break intervals
- 🌍 **Multi-language Support**: English, Brazilian Portuguese, Japanese, and more
- 🎨 **Modern UI**: Rounded design with smooth animations and shadows
- 🌙 **Dark Mode**: Automatic system preference detection
- 📊 **Activity Log**: Track your productivity sessions
- ⚙️ **Customizable Settings**: Adjust timers, notifications, and preferences
- 🖥️ **Cross-platform**: Windows, macOS, and Linux support

## Languages Supported

- 🇺🇸 English (en)
- 🇧🇷 Brazilian Portuguese (pt-BR)
- 🇯🇵 Japanese (ja)
- 🇪🇸 Spanish (es) - Coming soon
- 🇫🇷 French (fr) - Coming soon
- 🇩🇪 German (de) - Coming soon

## Installation

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Git

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PomoEffective.git
cd PomoEffective
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

## Building for Distribution

### All Platforms
```bash
yarn build:all
```

### Windows
```bash
yarn build:win
```

### macOS
```bash
yarn build:mac
```

### Linux
```bash
yarn build:linux
```

## Development Scripts

- `yarn start` - Start the Electron app in development mode
- `yarn package` - Package the app without distribution
- `yarn make` - Make distributables for the current platform
- `yarn publish` - Publish the app to GitHub releases
- `yarn lint` - Run ESLint on the source code

## Project Structure

```
PomoEffective/
├── app/                 # Main Electron app files
├── lib/                 # Frontend application
│   ├── elements/        # UI components
│   ├── locales/         # Translation files
│   ├── utils/           # Utility functions
│   └── styles.css       # Main stylesheet
├── modules/             # Backend modules
├── src/                 # Source files
└── package.json         # Project configuration
```

## Adding New Languages

1. Create a new translation file in `lib/locales/` (e.g., `fr.json`)
2. Add the language to the `languages` section in all translation files
3. Update the i18n configuration in `lib/i18n.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v2.0.0
- ✨ Added internationalization support (EN, PT-BR, JA)
- 🎨 Modernized UI with rounded corners and shadows
- 🔧 Updated to Electron 28
- 📱 Improved responsive design
- 🚀 Enhanced build system for multiple platforms

### v1.0.0
- 🎯 Initial release with basic Pomodoro functionality
- ⚙️ Basic settings and customization
- 📊 Activity logging
- �� Dark mode support
