import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface PomodoroSession {
  id: string
  type: 'work' | 'shortBreak' | 'longBreak'
  duration: number // in minutes
  completedAt: string // ISO date string
  date: string // YYYY-MM-DD format for easy grouping
}

export interface DailyStats {
  date: string
  workSessions: number
  totalWorkTime: number // in minutes
  shortBreaks: number
  longBreaks: number
}

interface StatisticsContextType {
  sessions: PomodoroSession[]
  addSession: (type: 'work' | 'shortBreak' | 'longBreak', duration: number) => void
  getDailyStats: (days: number) => DailyStats[]
  getTotalSessions: () => number
  getTodaySessions: () => number
  getWeeklyTotal: () => number
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined)

export const useStatistics = () => {
  const context = useContext(StatisticsContext)
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider')
  }
  return context
}

interface StatisticsProviderProps {
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

export const StatisticsProvider = ({ children }: StatisticsProviderProps) => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([])

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      if (isTauri()) {
        // Load from Tauri filesystem
        const fs = await getTauriFS()
        if (fs) {
          try {
            const sessionsContent = await fs.readTextFile('pomodoro-history.json', {
              dir: fs.BaseDirectory.AppData
            })
            const savedSessions = JSON.parse(sessionsContent)
            setSessions(savedSessions || [])
          } catch {
            // File doesn't exist yet, start with empty array
            setSessions([])
          }
        }
      } else {
        // Load from localStorage
        const savedSessions = localStorage.getItem('pomodoro-history')
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions)
          setSessions(parsed || [])
        }
      }
    } catch (error) {
      console.warn('Failed to load session history:', error)
      setSessions([])
    }
  }

  const saveSessions = async (newSessions: PomodoroSession[]) => {
    try {
      if (isTauri()) {
        // Save to Tauri filesystem
        const fs = await getTauriFS()
        if (fs) {
          await fs.writeTextFile('pomodoro-history.json', JSON.stringify(newSessions, null, 2), {
            dir: fs.BaseDirectory.AppData
          })
        }
      } else {
        // Save to localStorage
        localStorage.setItem('pomodoro-history', JSON.stringify(newSessions))
      }
    } catch (error) {
      console.warn('Failed to save session history:', error)
    }
  }

  const addSession = (type: 'work' | 'shortBreak' | 'longBreak', duration: number) => {
    const now = new Date()
    const newSession: PomodoroSession = {
      id: `${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      duration,
      completedAt: now.toISOString(),
      date: now.toISOString().split('T')[0], // YYYY-MM-DD
    }

    const updatedSessions = [...sessions, newSession]
    setSessions(updatedSessions)
    saveSessions(updatedSessions)
  }

  const getDailyStats = (days: number): DailyStats[] => {
    const today = new Date()
    const stats: DailyStats[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      const daySessions = sessions.filter(session => session.date === dateString)
      
      stats.push({
        date: dateString,
        workSessions: daySessions.filter(s => s.type === 'work').length,
        totalWorkTime: daySessions
          .filter(s => s.type === 'work')
          .reduce((total, s) => total + s.duration, 0),
        shortBreaks: daySessions.filter(s => s.type === 'shortBreak').length,
        longBreaks: daySessions.filter(s => s.type === 'longBreak').length,
      })
    }

    return stats
  }

  const getTotalSessions = (): number => {
    return sessions.filter(s => s.type === 'work').length
  }

  const getTodaySessions = (): number => {
    const today = new Date().toISOString().split('T')[0]
    return sessions.filter(s => s.type === 'work' && s.date === today).length
  }

  const getWeeklyTotal = (): number => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    return sessions.filter(s => 
      s.type === 'work' && 
      new Date(s.completedAt) >= weekAgo
    ).length
  }

  return (
    <StatisticsContext.Provider value={{
      sessions,
      addSession,
      getDailyStats,
      getTotalSessions,
      getTodaySessions,
      getWeeklyTotal
    }}>
      {children}
    </StatisticsContext.Provider>
  )
}
