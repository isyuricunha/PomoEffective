import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react'

export interface TimerSettings {
  work: number // in minutes
  shortBreak: number // in minutes
  longBreak: number // in minutes
  soundEnabled: boolean
  soundVolume?: number // 0..1
  soundName?: string // 'beep' for oscillator or filename under /sounds
  notificationsEnabled: boolean
}

const DEFAULT_SETTINGS: TimerSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  soundEnabled: true,
  soundVolume: 0.3,
  soundName: 'beep',
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
  return typeof window !== 'undefined' && '__TAURI__' in window
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

// Safely narrow parsed settings object
const toPartialTimerSettings = (input: unknown): Partial<TimerSettings> => {
  if (typeof input !== 'object' || input === null) return {}
  const obj = input as Record<string, unknown>
  return {
    work: typeof obj.work === 'number' ? obj.work : undefined,
    shortBreak: typeof obj.shortBreak === 'number' ? obj.shortBreak : undefined,
    longBreak: typeof obj.longBreak === 'number' ? obj.longBreak : undefined,
    soundEnabled: typeof obj.soundEnabled === 'boolean' ? obj.soundEnabled : undefined,
    soundVolume: typeof obj.soundVolume === 'number' ? obj.soundVolume : undefined,
    soundName: typeof obj.soundName === 'string' ? obj.soundName : undefined,
    notificationsEnabled: typeof obj.notificationsEnabled === 'boolean' ? obj.notificationsEnabled : undefined,
  }
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const saveTimerRef = useRef<number | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      if (isTauri()) {
        // Load from Tauri filesystem
        const fs = await getTauriFS()
        if (fs) {
          try {
            const settingsContent = await fs.readTextFile('pomodoro-settings.json', {
              dir: fs.BaseDirectory.AppData
            })
            const raw = JSON.parse(settingsContent) as unknown
            const partial = toPartialTimerSettings(raw)
            setSettings({ ...DEFAULT_SETTINGS, ...partial })
          } catch {
            // File doesn't exist yet, use defaults
          }
        }
      } else {
        // Load from localStorage
        const savedSettings = localStorage.getItem('pomodoro-settings')
        if (savedSettings) {
          const raw = JSON.parse(savedSettings) as unknown
          const partial = toPartialTimerSettings(raw)
          setSettings({ ...DEFAULT_SETTINGS, ...partial })
        }
      }
    } catch (error) {
      console.warn('Failed to load settings:', error)
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

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
    // debounce persisting
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = window.setTimeout(() => {
      void saveSettings(updatedSettings)
    }, 300)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    void saveSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
