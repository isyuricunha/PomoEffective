'use strict'
const html = require('bel')
const start = require('../../modules/start')
const updateSettings = require('../../modules/updateSettings')
const { t } = require('../i18n')

module.exports = function init(state, emit) {
  const { duration, breakDuration } = state.settings

  return html`
    <article>
      <div class="timer-display">
        <h2>${t('timer.pomodoro')}</h2>
        <div class="timer">
          <input
            type="number"
            value="${duration}"
            onchange=${event =>
      emit(updateSettings, {
        duration: parseInt(event.target.value, 10)
      })}
            title="${t('settings.pomodoroDuration')}"
          />
          <small>→</small>
          <input
            type="number"
            value="${breakDuration}"
            onchange=${event =>
      emit(updateSettings, {
        breakDuration: parseInt(event.target.value, 10)
      })}
            title="${t('settings.shortBreakDuration')}"
          />
        </div>
        <div class="timer-labels">
          <span>${t('timer.pomodoro')}</span>
          <span>${t('timer.shortBreak')}</span>
        </div>
      </div>
      <footer>
        <div class="timer-controls">
          <button type="submit" onclick=${() => emit(start)}>
            ${t('common.start')}
          </button>
        </div>
      </footer>
    </article>
  `
}
