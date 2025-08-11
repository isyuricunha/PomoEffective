'use strict'
const html = require('bel')
const start = require('../../modules/start')
const cancel = require('../../modules/cancel')
const { t } = require('../i18n')

module.exports = function finish(state, emit) {
  return html`
    <article>
      <div class="timer-display">
        <h2>🎉 ${t('timer.sessionComplete')}</h2>
        <p>
          ${t('timer.backToWork')}
        </p>
      </div>
      <footer>
        <div class="timer-controls">
          <button type="submit" onclick=${() => emit(start)}>
            ${t('common.start')}
          </button>
          <button onclick=${() => emit(cancel)}>
            ${t('common.reset')}
          </button>
        </div>
      </footer>
    </article>
  `
}
