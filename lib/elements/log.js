'use strict'
const html = require('bel')
const clearLog = require('../../modules/clearLog')
const setLocation = require('../../modules/setLocation')
const { t } = require('../i18n')

module.exports = function log(state, emit) {
  let prevDate
  let clearButton

  const logItems = state.log.reduceRight((acc, item) => {
    const date = new Date(item.time).toLocaleDateString()

    if (prevDate !== date) {
      acc[date] = []
      prevDate = date
    }

    acc[date].push(item.duration)

    return acc
  }, {})

  let logElement = Object.keys(logItems).map(date => {
    const length = logItems[date].length

    return html`
      <li>
        <span>${date}</span>
        <span>${'•'.repeat(length)} ${length}</span>
      </li>
    `
  })

  if (logElement.length === 0) {
    logElement = html`
      <div class="empty-state">
        <p>${t('log.noIntervals')}</p>
      </div>
    `
  } else {
    clearButton = html`
      <button
        onclick=${() => {
        emit(clearLog)
        emit(setLocation, 'timer')
      }}
      >
        ${t('common.clear')}
      </button>
    `
  }

  return html`
    <article>
      <header>
        <h1>${t('navigation.log')}</h1>
      </header>
      <div class="log-container">
        ${logElement.length > 0 ? html`
          <ul>
            ${logElement}
          </ul>
        ` : logElement}
      </div>
      <footer>
        ${clearButton}
      </footer>
    </article>
  `
}
