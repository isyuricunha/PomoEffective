import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface TimerSettings {
  work: number // in minutes
  shortBreak: number // in minutes
  longBreak: number // in minutes
  soundEnabled: boolean
  notificationsEnabled: boolean
}

const DEFAULT_SETTINGS: TimerSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  soundEnabled: true,
  notificationsEnabled: true,
}

interface SettingsContextType {
  settings: TimerSettings
  updateSettings: (newSettings: Partial<TimerSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined
}

// Tauri filesystem operations
const getTauriFS = async () => {
  try {
    const { readTextFile, writeTextFile, BaseDirectory } = await import('@tauri-apps/api/fs')
    return { readTextFile, writeTextFile, BaseDirectory }
  } catch {
    return null
  }
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      if (isTauri()) {
        // Load from Tauri filesystem
        const fs = await getTauriFS()
        if (fs) {
          try {
            const settingsContent = await fs.readTextFile('pomodoro-settings.json', {
              dir: fs.BaseDirectory.AppData
            })
            const savedSettings = JSON.parse(settingsContent)
            setSettings({ ...DEFAULT_SETTINGS, ...savedSettings })
          } catch {
            // File doesn't exist yet, use defaults
          }
        }
      } else {
        // Load from localStorage
        const savedSettings = localStorage.getItem('pomodoro-settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        }
      }
    } catch (error) {
      console.warn('Failed to load settings:', error)
    }
  }

  const saveSettings = async (newSettings: TimerSettings) => {
    try {
      if (isTauri()) {
        // Save to Tauri filesystem
        const fs = await getTauriFS()
        if (fs) {
          await fs.writeTextFile('pomodoro-settings.json', JSON.stringify(newSettings, null, 2), {
            dir: fs.BaseDirectory.AppData
          })
        }
      } else {
        // Save to localStorage
        localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings))
      }
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
