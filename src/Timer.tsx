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
        title: 'Pomodoro Timer',
        body: `${currentStateLabel} completed! ${timerState === 'work' ? 'Time for a break!' : 'Ready to focus?'}`,
        icon: '/vite.svg'
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

  // Get display info for current state
  const getStateInfo = () => {
    switch (timerState) {
      case 'work':
        return {
          label: 'Focus Session',
          emoji: '🍅',
          bgColor: 'from-red-50 to-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          textColor: 'text-red-600'
        }
      case 'shortBreak':
        return {
          label: 'Short Break',
          emoji: '☕',
          bgColor: 'from-green-50 to-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          textColor: 'text-green-600'
        }
      case 'longBreak':
        return {
          label: 'Long Break',
          emoji: '🌟',
          bgColor: 'from-blue-50 to-blue-100',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          textColor: 'text-blue-600'
        }
    }
  }

  const stateInfo = getStateInfo()
  const { theme, toggleTheme } = useTheme()

  // Calculate progress percentage
  const getProgress = () => {
    const totalTime = timerConfig[timerState]
    return ((totalTime - timeLeft) / totalTime) * 100
  }
  
  // Update timer when settings change
  useEffect(() => {
    if (timerStatus === 'idle') {
      setTimeLeft(timerConfig[timerState])
    }
  }, [settings, timerState, timerStatus])

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : `bg-gradient-to-br ${stateInfo.bgColor}`
    } flex items-center justify-center p-4`}>
      <div className={`rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 backdrop-blur-sm transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gray-800/90 border border-gray-700'
          : 'bg-white/95 border border-white/20'
      }`}>
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={() => setShowStatistics(true)}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📊
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
              theme === 'dark'
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="text-5xl mb-3 animate-pulse">{stateInfo.emoji}</div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors ${
              theme === 'dark' ? 'text-yellow-400' : stateInfo.textColor
            }`}>
              {stateInfo.label}
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Session {cycleCount + 1} • {getTodaySessions()} completed today
            </p>
          </div>

          {/* Progress Ring */}
          <div className="relative mb-8">
            <svg className="w-64 h-64 mx-auto transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="3"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={theme === 'dark' ? '#fbbf24' : stateInfo.textColor.replace('text-', '#')}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-4xl md:text-5xl font-mono font-bold transition-colors ${
                theme === 'dark' ? 'text-yellow-400' : stateInfo.textColor
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-4">
            {timerStatus === 'idle' && (
              <button
                onClick={startTimer}
                className={`w-full font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                    : `${stateInfo.buttonColor} text-white`
                }`}
              >
                ▶️ Start Timer
              </button>
            )}

            {timerStatus === 'running' && (
              <button
                onClick={pauseTimer}
                className={`w-full font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-orange-500 hover:bg-orange-400 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                ⏸️ Pause Timer
              </button>
            )}

            {timerStatus === 'paused' && (
              <button
                onClick={startTimer}
                className={`w-full font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                    : `${stateInfo.buttonColor} text-white`
                }`}
              >
                ▶️ Resume Timer
              </button>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetTimer}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                🔄 Reset
              </button>
              <button
                onClick={resetCycle}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                🆕 New Cycle
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-center space-x-3 mb-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-500 transform ${
                    i < cycleCount % 4
                      ? theme === 'dark'
                        ? 'bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/50'
                        : `${stateInfo.textColor.replace('text-', 'bg-')} scale-110 shadow-lg`
                      : theme === 'dark'
                        ? 'bg-gray-600'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              🍅 Pomodoro Progress ({cycleCount % 4}/4)
            </p>
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
