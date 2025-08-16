import { useState, useEffect, useRef } from 'react'
import { useTheme } from './contexts/ThemeContext'
import { useSettings } from './contexts/SettingsContext'
import { useStatistics } from './contexts/StatisticsContext'
import { sendNotification, playNotificationSound } from './utils/notifications'
import Settings from './components/Settings'
import Statistics from './components/Statistics'

export type TimerState = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

interface TimerConfig {
  work: number
  shortBreak: number
  longBreak: number
}

// This will be replaced by settings from context

const Timer = () => {
  const { settings } = useSettings()
  const { addSession, getTodaySessions } = useStatistics()
  const [showSettings, setShowSettings] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  
  // Convert settings from minutes to seconds
  const timerConfig: TimerConfig = {
    work: settings.work * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
  }
  
  const [timeLeft, setTimeLeft] = useState(timerConfig.work)
  const [timerState, setTimerState] = useState<TimerState>('work')
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle')
  const [cycleCount, setCycleCount] = useState(0)
  const intervalRef = useRef<number | null>(null)

  // Timer countdown effect
  useEffect(() => {
    if (timerStatus === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished - auto-switch to next cycle
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerStatus, timeLeft])

  const handleTimerComplete = async () => {
    setTimerStatus('idle')
    
    // Record completed session
    const sessionDuration = timerState === 'work' ? settings.work : 
                           timerState === 'shortBreak' ? settings.shortBreak : settings.longBreak
    addSession(timerState, sessionDuration)
    
    // Send notification and play sound
    const currentStateLabel = getStateInfo().label
    if (settings.notificationsEnabled) {
      await sendNotification({
        title: 'YuPomo',
        body: `${currentStateLabel} completed! ${timerState === 'work' ? 'Time for a break!' : 'Ready to focus?'}`,
      })
    }
    
    if (settings.soundEnabled) {
      playNotificationSound()
    }
    
    // Cycle logic: Work -> Short Break -> Work -> Short Break -> Work -> Long Break
    if (timerState === 'work') {
      setCycleCount(prev => prev + 1)
      // After 4 work sessions, take a long break
      if ((cycleCount + 1) % 4 === 0) {
        setTimerState('longBreak')
        setTimeLeft(timerConfig.longBreak)
      } else {
        setTimerState('shortBreak')
        setTimeLeft(timerConfig.shortBreak)
      }
    } else {
      // After any break, return to work
      setTimerState('work')
      setTimeLeft(timerConfig.work)
    }
  }

  const startTimer = () => {
    setTimerStatus('running')
  }

  const pauseTimer = () => {
    setTimerStatus('paused')
  }

  const resetTimer = () => {
    setTimerStatus('idle')
    setTimeLeft(timerConfig[timerState])
  }

  const resetCycle = () => {
    setTimerStatus('idle')
    setTimerState('work')
    setTimeLeft(timerConfig.work)
    setCycleCount(0)
  }

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get display info for current state (minimal)
  const getStateInfo = () => {
    switch (timerState) {
      case 'work':
        return { label: 'Focus Session' }
      case 'shortBreak':
        return { label: 'Short Break' }
      case 'longBreak':
        return { label: 'Long Break' }
    }
  }

  const stateInfo = getStateInfo()
  const { theme, toggleTheme } = useTheme()

  
  // Update timer when settings change
  useEffect(() => {
    if (timerStatus === 'idle') {
      setTimeLeft(timerConfig[timerState])
    }
  }, [settings, timerState, timerStatus])

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-neutral-100'
    } flex items-center justify-center p-4`}>
      <div className={`rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-neutral-950 border border-neutral-800'
          : 'bg-white border border-neutral-200'
      }`}>
        {/* Minimal Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${theme === 'dark' ? 'bg-red-500/30' : 'bg-red-400'}`} />
            <span className={`h-3 w-3 rounded-full ${theme === 'dark' ? 'bg-yellow-500/30' : 'bg-yellow-400'}`} />
            <span className={`h-3 w-3 rounded-full ${theme === 'dark' ? 'bg-green-500/30' : 'bg-green-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatistics(true)}
              className={`px-2 py-1 rounded-md text-sm ${
                theme === 'dark' ? 'text-amber-400 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-label="Statistics"
            >📊</button>
            <button
              onClick={() => setShowSettings(true)}
              className={`px-2 py-1 rounded-md text-sm ${
                theme === 'dark' ? 'text-amber-400 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-label="Settings"
            >⚙️</button>
            <button
              onClick={toggleTheme}
              className={`px-2 py-1 rounded-md text-sm ${
                theme === 'dark' ? 'text-amber-400 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-label="Toggle Theme"
            >{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center select-none">
          <div className={`mb-2 text-xs tracking-widest uppercase ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            {stateInfo.label}
          </div>
          <div className={`${
            theme === 'dark' ? 'text-neutral-100' : 'text-neutral-800'
          } font-light font-mono tracking-tight text-6xl sm:text-7xl md:text-8xl`}>
            {formatTime(timeLeft)}
          </div>

          <div className={`mt-8 text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'}`}>
            Session {cycleCount + 1} • {getTodaySessions()} today
          </div>

          {/* Control Buttons */}
          <div className="space-y-3 mt-8">
            {timerStatus === 'idle' && (
              <button
                onClick={startTimer}
                className={`w-full font-medium py-3 px-6 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                ▶️ Start
              </button>
            )}

            {timerStatus === 'running' && (
              <button
                onClick={pauseTimer}
                className={`w-full font-medium py-3 px-6 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-600 hover:bg-amber-500 text-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                ⏸️ Pause
              </button>
            )}

            {timerStatus === 'paused' && (
              <button
                onClick={startTimer}
                className={`w-full font-medium py-3 px-6 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                ▶️ Resume
              </button>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetTimer}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={resetCycle}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                New Cycle
              </button>
            </div>
          </div>

          {/* Minimal Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-center gap-2">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-8 rounded-full ${
                    i < cycleCount % 4
                      ? theme === 'dark' ? 'bg-amber-500' : 'bg-neutral-800'
                      : theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Statistics Modal */}
      <Statistics 
        isOpen={showStatistics} 
        onClose={() => setShowStatistics(false)} 
      />
    </div>
  )
}

export default Timer
