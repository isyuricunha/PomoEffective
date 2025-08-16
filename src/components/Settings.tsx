import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { useTheme } from '../contexts/ThemeContext'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { theme } = useTheme()
  const [tempSettings, setTempSettings] = useState(settings)

  if (!isOpen) return null

  const handleSave = () => {
    updateSettings(tempSettings)
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-yellow-400' : 'text-gray-800'
          }`}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Timer Settings */}
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Timer Durations
            </h3>
            
            <div className="space-y-4">
              {/* Work Duration */}
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  🍅 Work Session
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
                        ? 'bg-gray-700 border border-gray-600 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    min
                  </span>
                </div>
              </div>

              {/* Short Break Duration */}
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ☕ Short Break
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
                    min
                  </span>
                </div>
              </div>

              {/* Long Break Duration */}
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  🌟 Long Break
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
                    min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Notifications & Sound
            </h3>
            
            <div className="space-y-4">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <label className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  🔊 Sound Alerts
                </label>
                <button
                  onClick={() => handleInputChange('soundEnabled', !tempSettings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tempSettings.soundEnabled
                      ? theme === 'dark' ? 'bg-yellow-500' : 'bg-blue-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
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
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  🔔 Desktop Notifications
                </label>
                <button
                  onClick={() => handleInputChange('notificationsEnabled', !tempSettings.notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tempSettings.notificationsEnabled
                      ? theme === 'dark' ? 'bg-yellow-500' : 'bg-blue-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
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
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🔄 Reset
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              💾 Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
