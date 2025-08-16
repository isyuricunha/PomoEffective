import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../contexts/SettingsContext'
import { useTheme } from '../contexts/ThemeContext'

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

  if (!isOpen) return null

  const handleSave = () => {
    updateSettings(tempSettings)
    // persist language and switch
    try {
      localStorage.setItem('lang', lang)
    } catch {}
    i18n.changeLanguage(lang)
    onClose()
  }

  const handleReset = () => {
    resetSettings()
    setTempSettings({
      work: 25,
      shortBreak: 5,
      longBreak: 15,
      soundEnabled: true,
      notificationsEnabled: true,
    })
  }

  const handleInputChange = (field: keyof typeof tempSettings, value: number | boolean) => {
    setTempSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transition-colors duration-300 ${
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
            <div className="flex items-center justify-between">
              <label className={`font-medium ${
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
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
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
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
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
                        ? 'bg-gray-700 border border-gray-600 text-white'
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
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
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
                        ? 'bg-gray-700 border border-gray-600 text-white'
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

          {/* Notification Settings */}
          <div>
            <h3 className={`text-sm font-medium mb-4 ${
              theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              {t('settings.notificationsAndSound')}
            </h3>
            
            <div className="space-y-4">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
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

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
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
          <div className="flex gap-3 pt-4">
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
      </div>
    </div>
  )
}

export default Settings
