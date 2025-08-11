# Contributing to PomoEffective

Thank you for your interest in contributing to PomoEffective! This guide will help you get started with development and understand how to contribute effectively.

## Development Setup

### Prerequisites
- Node.js 18+
- Yarn package manager
- Git

### Getting Started
1. Fork and clone the repository
2. Install dependencies: `yarn install`
3. Start development server: `yarn start`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Project Architecture

### Frontend (lib/)
- **elements/**: UI components using bel (hyperscript)
- **locales/**: Translation files for internationalization
- **utils/**: Utility functions
- **styles.css**: Main stylesheet with CSS custom properties

### Backend (modules/)
- **start.js**: Timer start logic
- **tick.js**: Timer tick handling
- **settings.js**: Settings management
- **log.js**: Activity logging

### Internationalization (i18n)

#### Adding New Languages

1. **Create translation file**: Add a new JSON file in `lib/locales/`
   ```json
   {
     "common": {
       "start": "Start",
       "pause": "Pause"
     }
   }
   ```

2. **Update i18n.js**: Add the new language to the resources
   ```javascript
   const newLang = require('./locales/newlang.json')
   
   resources: {
     en: { translation: en },
     'pt-BR': { translation: ptBR },
     ja: { translation: ja },
     newlang: { translation: newLang }
   }
   ```

3. **Add to language selector**: Update all translation files to include the new language in the `languages` section

#### Translation Guidelines

- Use clear, concise language
- Maintain consistent terminology
- Consider cultural context
- Test with native speakers when possible
- Keep translations up to date with UI changes

### UI Development

#### CSS Architecture
- Use CSS custom properties for theming
- Follow BEM-like naming conventions
- Maintain responsive design principles
- Use modern CSS features (Grid, Flexbox, etc.)

#### Component Structure
- Each component should be self-contained
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)
- Follow the existing pattern for internationalization

## Code Style

### JavaScript
- Use strict mode: `'use strict'`
- Follow existing naming conventions
- Use ES6+ features when appropriate
- Keep functions small and focused

### CSS
- Use CSS custom properties for theming
- Organize properties logically
- Add comments for complex selectors
- Use consistent spacing and formatting

## Testing

### Manual Testing
- Test on all supported platforms
- Verify internationalization works correctly
- Check accessibility features
- Test responsive design

### Automated Testing
- Run linting: `yarn lint`
- Test build process: `yarn build:win` (or other platforms)
- Verify package creation

## Building and Distribution

### Local Builds
```bash
# Windows
yarn build:win

# macOS
yarn build:mac

# Linux
yarn build:linux

# All platforms
yarn build:all
```

### Release Process
1. Update version in `package.json`
2. Create and push a git tag: `git tag v2.0.0 && git push origin v2.0.0`
3. GitHub Actions will automatically build and release
4. Verify all platform builds are successful

## Common Issues and Solutions

### Build Failures
- Ensure all dependencies are installed: `yarn install`
- Check Node.js version compatibility
- Verify platform-specific build tools are available

### Internationalization Issues
- Check translation file syntax (valid JSON)
- Verify all keys exist in all language files
- Test language switching functionality

### UI Rendering Problems
- Check CSS custom properties are defined
- Verify responsive breakpoints
- Test on different screen sizes

## Getting Help

- Check existing issues and pull requests
- Review the documentation
- Ask questions in discussions
- Join the community chat (if available)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

Thank you for contributing to PomoEffective! 🎉
