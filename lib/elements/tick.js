'use strict'
const html = require('bel')
const formatMs = require('../utils/formatMs')
const breakTip = require('../utils/breakTip')
const cancel = require('../../modules/cancel')
const { t } = require('../i18n')

let nextTip
let prevStage

module.exports = function timer(state, emit) {
  const { breakDuration } = state.settings
  const { stage, remainingTime } = state.timer
  let pageElement

  if (prevStage !== stage) {
    nextTip = breakTip()
    prevStage = stage
  }

  if (stage === 'interval') {
    pageElement = html`
      <div class="timer-display">
        <h2>${t('timer.interval')}</h2>
        <div class="timer">
          ${formatMs(remainingTime)}
        </div>
      </div>
    `
  } else {
    pageElement = html`
      <div class="timer-display">
        <h2>${t('timer.breakTime')}</h2>
        <p>
          ${t('timer.sessionComplete')} ${t('timer.shortBreak')}: ${breakDuration} ${t('common.minutes')}. ${nextTip}.
        </p>
      </div>
    `
  }

  return html`
    <article>
      ${pageElement}
      <footer>
        <div class="timer-controls">
          <button type="reset" onclick=${() => emit(cancel)}>
            ${t('common.cancel')}
          </button>
        </div>
      </footer>
    </article>
  `
}
