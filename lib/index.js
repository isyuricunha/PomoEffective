'use strict'
const morph = require('nanomorph')
const url = require('url')
const syncData = require('dact-electron')
const {ipcRenderer} = require('electron')
const main = require('./elements/main')
const {readLog, writeLog} = require('./utils/log')
const applyMode = require('./utils/applyMode')
const mergeLog = require('../modules/mergeLog')
const createData = require('../modules/createData')

const log = readLog()
const data = createData(syncData(ipcRenderer))
let systemPreferences = url.parse(window.location.href, true).query

data.emit(mergeLog, log)
applyMode(data.state.settings, systemPreferences)

const body = document.querySelector('body')
let tree = body.appendChild(main(data.state, data.emit))

data.subscribe(() => {
  tree = morph(tree, main(data.state, data.emit))
})

data.subscribe('log', () => {
  writeLog(data.state.log)
})

data.subscribe('settings', () => {
  applyMode(data.state.settings, systemPreferences)
})

ipcRenderer.on('system:preferences', (event, preferences) => {
  applyMode(data.state.settings, preferences)
  systemPreferences = preferences
})
