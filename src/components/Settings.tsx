import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../contexts/SettingsContext'
import { useTheme } from '../contexts/ThemeContext'
import { compareSemver, fetchLatestRelease } from '../utils/version'
import { sendNotification, playNotificationSound } from '../utils/notifications'
import { useUpdateCheck } from '../hooks/useUpdateCheck'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { t, i18n } = useTranslation()
  const { settings, updateSettings, resetSettings } = useSettings()
  const { theme } = useTheme()
  const [tempSettings, setTempSettings] = useState(settings)
  const [lang, setLang] = useState<string>(() => (typeof window !== 'undefined' && (localStorage.getItem('lang') || i18n.language)) || 'en')
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string>('')
  const { latest } = useUpdateCheck()

  // auto-update preference (Tauri only)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('yupomo-auto-update') !== 'false' } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('yupomo-auto-update', String(autoUpdateEnabled)) } catch {/* ignore */}
  }, [autoUpdateEnabled])

  if (!isOpen) return null

  const handleSave = () => {
    updateSettings(tempSettings)
    // persist language and switch
    try {
      localStorage.setItem('lang', lang)
    } catch {
      // ignore storage quota or privacy mode errors
    }
    void i18n.changeLanguage(lang)
    onClose()
  }

  const handleReset = () => {
    resetSettings()
    setTempSettings({
      work: 25,
      shortBreak: 5,
      longBreak: 15,
      soundEnabled: true,
      soundVolume: 0.3,
      soundName: 'beep',
      notificationsEnabled: true,
    })
  }

  const handleCheckUpdates = async () => {
    try {
      setCheckingUpdate(true)
      setUpdateStatus('')
      const latest = await fetchLatestRelease('isyuricunha', 'YuPomo')
      if (!latest) {
        setUpdateStatus(t('updates.statusUnavailable'))
        return
      }
      const current = (typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0')
      const cmp = compareSemver(current, latest.latestVersion)
      if (cmp < 0) {
        setUpdateStatus(t('updates.statusAvailable', { latest: latest.latestVersion, current }))
        void sendNotification({
          title: t('updates.notifyTitle'),
          body: t('updates.notifyBody', { version: latest.latestVersion }),
        })
      } else {
        setUpdateStatus(t('updates.statusUpToDate'))
      }
    } finally {
      setCheckingUpdate(false)
    }
  }

  const handleInstallUpdate = async () => {
    // Only works on Tauri when updater is configured; otherwise open the release page
    try {
      const { checkUpdate, installUpdate } = await import('@tauri-apps/api/updater')
      const { open } = await import('@tauri-apps/api/shell')
      const info = await checkUpdate()
      if (info.shouldUpdate) {
        await installUpdate()
      } else if (latest?.htmlUrl) {
        await open(latest.htmlUrl)
      }
    } catch {
      // fallback: open latest release in default browser (web or tauri shell not available)
      if (latest?.htmlUrl) {
        try {
          window.open(latest.htmlUrl, '_blank', 'noopener,noreferrer')
        } catch {/* ignore */}
      }
    }
  }

  const handleInputChange = (field: keyof typeof tempSettings, value: number | boolean | string | undefined) => {
    setTempSettings(prev => ({ ...prev, [field]: value }))
  }

  // no upload support; sounds should be placed under /sounds and referenced by filename

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-neutral-950 border border-neutral-800'
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-amber-400' : 'text-gray-800'
          }`}>
            ⚙️ {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'text-neutral-400 hover:bg-neutral-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Timer Settings */}
        <div className="space-y-6">
          {/* Language */}
          <div>
            <h3 className={`text-sm font-medium mb-4 ${
              theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              {t('settings.language')}
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className={`font-medium min-w-0 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
              }`}>
                🌐
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className={`px-3 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-neutral-900 border border-neutral-800 text-neutral-100' : 'bg-gray-50 border border-gray-300 text-gray-900'
                }`}
              >
                <option value="en">{t('languages.en')}</option>
                <option value="pt-BR">{t('languages.pt-BR')}</option>
                <option value="es">{t('languages.es')}</option>
                <option value="fr">{t('languages.fr')}</option>
                <option value="de">{t('languages.de')}</option>
                <option value="it">{t('languages.it')}</option>
                <option value="ru">{t('languages.ru')}</option>
                <option value="ja">{t('languages.ja')}</option>
                <option value="zh-CN">{t('languages.zh-CN')}</option>
                <option value="ko">{t('languages.ko')}</option>
                <option value="ar">{t('languages.ar')}</option>
                <option value="he">{t('languages.he')}</option>
                <option value="fa">{t('languages.fa')}</option>
                <option value="hi">{t('languages.hi')}</option>
                <option value="tr">{t('languages.tr')}</option>
              </select>
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-medium mb-4 ${
              theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              {t('settings.timerDurations')}
            </h3>
            
            <div className="space-y-4">
              {/* Work Duration */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className={`font-medium min-w-0 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
                }`}>
                  🍅 {t('settings.workSession')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.work}
                    onChange={(e) => handleInputChange('work', parseInt(e.target.value) || 1)}
                    className={`w-16 px-2 py-1 rounded-lg text-center font-mono ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-100'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                  }`}>
                    {t('settings.minutes')}
                  </span>
                </div>
              </div>

              {/* Short Break Duration */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className={`font-medium min-w-0 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
                }`}>
                  ☕ {t('settings.shortBreak')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.shortBreak}
                    onChange={(e) => handleInputChange('shortBreak', parseInt(e.target.value) || 1)}
                    className={`w-16 px-2 py-1 rounded-lg text-center font-mono ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-100'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {t('settings.minutes')}
                  </span>
                </div>
              </div>

              {/* Long Break Duration */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className={`font-medium min-w-0 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
                }`}>
                  🌟 {t('settings.longBreak')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.longBreak}
                    onChange={(e) => handleInputChange('longBreak', parseInt(e.target.value) || 1)}
                    className={`w-16 px-2 py-1 rounded-lg text-center font-mono ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-100'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {t('settings.minutes')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'} border-t my-4`} />

          {/* Notification Settings */}
          <div>
            <h3 className={`text-sm font-medium mb-4 ${
              theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              {t('settings.notificationsAndSound')}
            </h3>

            <div className="space-y-4">
              {/* Sound Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className={`font-medium min-w-0 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
                }`}>
                  🔊 {t('settings.soundAlerts')}
                </label>
                <button
                  onClick={() => handleInputChange('soundEnabled', !tempSettings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tempSettings.soundEnabled
                      ? theme === 'dark' ? 'bg-amber-500' : 'bg-blue-600'
                      : theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tempSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider */}
              {tempSettings.soundEnabled && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className={`${theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'} font-medium`}>🔈 {t('sound.volume')}</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={typeof tempSettings.soundVolume === 'number' ? tempSettings.soundVolume : 0.3}
                      onChange={(e) => handleInputChange('soundVolume', parseFloat(e.target.value))}
                      className="w-full sm:w-40"
                    />
                  </div>
                </div>
              )}

              {/* Quick preview of default sounds */}
              {tempSettings.soundEnabled && (
                <div className="mt-3 space-y-2">
                  <div className={`${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'} text-sm`}>{t('sound.quickPreview')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => playNotificationSound({ volume: typeof tempSettings.soundVolume === 'number' ? tempSettings.soundVolume : 0.3, sourceUrl: '/sounds/start.mp3' })}
                      className={`${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-3 py-2 rounded-lg text-sm text-left`}
                    >
                      ▶️ {t('sound.start')}
                    </button>
                    <button
                      type="button"
                      onClick={() => playNotificationSound({ volume: typeof tempSettings.soundVolume === 'number' ? tempSettings.soundVolume : 0.3, sourceUrl: '/sounds/pause.mp3' })}
                      className={`${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-3 py-2 rounded-lg text-sm text-left`}
                    >
                      ⏸️ {t('sound.pause')}
                    </button>
                    <button
                      type="button"
                      onClick={() => playNotificationSound({ volume: typeof tempSettings.soundVolume === 'number' ? tempSettings.soundVolume : 0.3, sourceUrl: '/sounds/break.mp3' })}
                      className={`${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-3 py-2 rounded-lg text-sm text-left`}
                    >
                      🧘 {t('sound.startBreak')}
                    </button>
                    <button
                      type="button"
                      onClick={() => playNotificationSound({ volume: typeof tempSettings.soundVolume === 'number' ? tempSettings.soundVolume : 0.3, sourceUrl: '/sounds/end-break.mp3' })}
                      className={`${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-3 py-2 rounded-lg text-sm text-left`}
                    >
                      ✅ {t('sound.endBreak')}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className={`font-medium min-w-0 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
                }`}>
                  🔔 {t('settings.desktopNotifications')}
                </label>
                <button
                  onClick={() => handleInputChange('notificationsEnabled', !tempSettings.notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tempSettings.notificationsEnabled
                      ? theme === 'dark' ? 'bg-amber-500' : 'bg-blue-600'
                      : theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tempSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleReset}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🔄 {t('settings.reset')}
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              💾 {t('settings.save')}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className={`${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'} border-t my-4`} />

        {/* Updates */}
        <div>
          <h3 className={`text-sm font-medium mb-4 ${
            theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
          }`}>
            {t('updates.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
                {updateStatus || t('updates.manualPrompt')}
              </div>
              <button
                onClick={handleCheckUpdates}
                disabled={checkingUpdate}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                } ${checkingUpdate ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {checkingUpdate ? t('updates.checking') : t('updates.checkNow')}
              </button>
            </div>

            {/* If we know latest via the hook, show quick actions */}
            {latest && compareSemver((typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0'), latest.latestVersion) < 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={latest.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-amber-400 hover:underline' : 'text-blue-600 hover:underline'} text-sm`}
                >
                  {t('updates.openLatest', { version: latest.latestVersion })}
                </a>
                <button
                  onClick={handleInstallUpdate}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {t('updates.downloadAndInstall')}
                </button>
              </div>
            )}

            {/* Auto update toggle (Tauri only; harmless on web) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className={`font-medium min-w-0 ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>
                ⚡ {t('updates.autoUpdateLabel')}
              </label>
              <button
                onClick={() => setAutoUpdateEnabled(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoUpdateEnabled
                    ? theme === 'dark' ? 'bg-amber-500' : 'bg-blue-600'
                    : theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoUpdateEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
