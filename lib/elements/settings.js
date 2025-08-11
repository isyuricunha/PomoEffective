'use strict'
const html = require('bel')
const listOfSettings = require('./listOfSettings')
const normalizeSettings = require('../../modules/normalizeSettings')
const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = require('../i18n')

module.exports = function settings({ settings }, emit) {
  const state = normalizeSettings(settings)
  const currentLang = getCurrentLanguage()
  const availableLangs = getAvailableLanguages()

  const handleLanguageChange = (event) => {
    const newLang = event.target.value
    changeLanguage(newLang)
    // Trigger a re-render to update all text
    emit('language:changed', newLang)
  }

  return html`
    <article>
      <header>
        <h1>${t('common.settings')}</h1>
      </header>
      
      <div class="settings-panel">
        <h3>${t('common.language')}</h3>
        <div class="language-selector">
          <select onchange=${handleLanguageChange} value=${currentLang}>
            ${availableLangs.map(lang => html`
              <option value="${lang}">${t(`languages.${lang}`)}</option>
            `)}
          </select>
        </div>
      </div>
      
      <ul>
        ${listOfSettings(state, emit)}
      </ul>
    </article>
  `
}
