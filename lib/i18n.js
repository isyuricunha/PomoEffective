'use strict'

const i18next = require('i18next')
const LanguageDetector = require('i18next-browser-languagedetector')

// Import all language files
const en = require('./locales/en.json')
const ptBR = require('./locales/pt-BR.json')
const ja = require('./locales/ja.json')

// Initialize i18next
i18next
    .use(LanguageDetector)
    .init({
        debug: false,
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            'pt-BR': { translation: ptBR },
            ja: { translation: ja }
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage']
        }
    })

// Function to change language
function changeLanguage(lng) {
    return i18next.changeLanguage(lng)
}

// Function to get current language
function getCurrentLanguage() {
    return i18next.language
}

// Function to get available languages
function getAvailableLanguages() {
    return Object.keys(i18next.options.resources)
}

// Function to translate text
function t(key, options = {}) {
    return i18next.t(key, options)
}

module.exports = {
    i18next,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    t
}
