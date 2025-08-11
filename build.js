#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const platforms = {
    win: 'Windows',
    mac: 'macOS',
    linux: 'Linux'
};

const buildCommands = {
    win: 'yarn build:win',
    mac: 'yarn build:mac',
    linux: 'yarn build:linux'
};

function buildForPlatform(platform) {
    console.log(`🚀 Building for ${platforms[platform]}...`);

    try {
        execSync(buildCommands[platform], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log(`✅ ${platforms[platform]} build completed successfully!`);
    } catch (error) {
        console.error(`❌ ${platforms[platform]} build failed:`, error.message);
        process.exit(1);
    }
}

function buildAll() {
    console.log('🌍 Building for all platforms...\n');

    Object.keys(platforms).forEach(platform => {
        buildForPlatform(platform);
        console.log(''); // Add spacing between builds
    });

    console.log('🎉 All builds completed!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const target = args[0];

if (!target || target === 'all') {
    buildAll();
} else if (platforms[target]) {
    buildForPlatform(target);
} else {
    console.log('Usage: node build.js [win|mac|linux|all]');
    console.log('  win   - Build for Windows');
    console.log('  mac   - Build for macOS');
    console.log('  linux - Build for Linux');
    console.log('  all   - Build for all platforms (default)');
    process.exit(1);
}
