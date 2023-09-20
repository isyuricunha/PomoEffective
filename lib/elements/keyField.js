'use strict'
const html = require('bel')
const modifierKeys = require('../utils/modifierKeys')
const createShortcut = require('../utils/createShortcut')
const setKeyboard = require('../../modules/setKeyboard')
const updateSettings = require('../../modules/updateSettings')

module.exports = function keyField (value, emit, merge) {
  const combination = value
    .split('+')
    .map(v => (modifierKeys[v] && modifierKeys[v].symbol) || v)
    .join('')

  return html`
    <input
      type="text"
      value="${combination}"
      readonly
      onfocus=${event => emit(setKeyboard, false)}
      onblur=${event => emit(setKeyboard, true)}
      onkeydown=${event =>
        emit(updateSettings, merge(createShortcut(event, value)))}
    />
  `
}
