'use strict'
const syncData = require('dact-electron')
const {
  app,
  ipcMain,
  BrowserWindow,
  Menu,
  Tray,
  systemPreferences
} = require('electron')
const {join} = require('path')
// const {autoUpdater} = require('electron-updater')
const stageIcon = require('./stageIcon')
const menuTemplate = require('./menuTemplate')
const updateShortcuts = require('./updateShortcuts')
const createKeyboardCallbacks = require('./createKeyboardCallbacks')
const createData = require('../modules/createData')
const settings = require('../modules/settings')
const updateSettings = require('../modules/updateSettings')
const normalizeSettings = require('../modules/normalizeSettings')
const startBreak = require('../modules/startBreak')
const tick = require('../modules/tick')
const finish = require('../modules/finish')

module.exports = function createWindow () {
  const root = join(__dirname, '..')
  const appSettings = settings.getAll()

  const darkMode =
    process.platform === 'darwin' && appSettings.followSystemAppearance
      ? systemPreferences.isDarkMode()
      : appSettings.darkMode

  let tray
  let lastStage
  let hideTimeout

  const window = new BrowserWindow({
    width: 300,
    height: 300,
    icon: `file://${root}/build/icon.png`,
    show: false,
    resizable: false,
    fullscreenable: false,
    backgroundColor: darkMode ? '#28292b' : 'white',
    title: 'Thomas',
    titleBarStyle: 'hiddenInset'
  })

  window.loadURL(`file://${root}/lib/index.html?darkMode=${darkMode}`)

  window.hideAll = () => {
    if (process.platform === 'darwin') {
      app.hide()
    } else {
      window.hide()
    }
  }

  const data = createData(syncData(ipcMain, window))
  const menu = Menu.buildFromTemplate(menuTemplate())
  const keyboardCallbacks = createKeyboardCallbacks(window, data)

  Menu.setApplicationMenu(menu)

  // if (process.platform !== 'linux') {
  //   autoUpdater.checkForUpdatesAndNotify()
  // }

  data.subscribe('timer', () => {
    const {stage, timeout} = data.state.timer

    setTimeout(() => {
      const {progressBar} = data.state.settings
      const {stage, remainingTime} = data.state.timer

      if (remainingTime > 0 && stage) {
        data.emit(tick)
      }

      if (remainingTime > 0 && stage === 'interval' && progressBar) {
        window.setProgressBar(
          1 - remainingTime / data.state.settings.duration / 6e4
        )
      }

      if (remainingTime <= 0 && (stage === 'interval' || stage === 'break')) {
        data.emit(stage === 'interval' ? startBreak : finish)
        window.showInactive()

        hideTimeout = setTimeout(() => {
          window.hideAll()
          clearTimeout(hideTimeout)
        }, 5000)
      }
    }, timeout)

    if (lastStage !== stage) {
      if (lastStage === 'interval') {
        window.setProgressBar(-1)
      }

      if (tray) {
        tray.setImage(stageIcon(stage))
      }

      lastStage = stage
    }
  })

  data.subscribe('settings', () => {
    const {stage} = data.state.timer
    const {trayIcon, progressBar} = data.state.settings

    settings.setAll(normalizeSettings(data.state.settings), {prettify: true})

    if (!tray && trayIcon) {
      tray = new Tray(stageIcon(stage))

      tray.on('click', () => {
        window.show()
      })

      if (app.dock) {
        app.dock.hide()
      }
    } else if (tray) {
      tray.destroy()
      tray = null
      app.dock.show()
    }

    if (progressBar) {
      window.setProgressBar(-1)
    }

    updateShortcuts(window, data.state, keyboardCallbacks)
  })

  data.subscribe('keyboardEvents', () => {
    updateShortcuts(window, data.state, keyboardCallbacks)
  })

  if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        window.webContents.send('system:preferences', {
          darkMode: systemPreferences.isDarkMode()
        })
      }
    )
  }

  window.once('ready-to-show', () => {
    window.show()
  })

  window.on('focus', () => {
    clearTimeout(hideTimeout)
  })

  window.on('show', () => {
    data.emit(updateSettings, settings.getAll())
  })
}
