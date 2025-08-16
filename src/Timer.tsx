import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './contexts/ThemeContext'
import Settings from './components/Settings'
import Statistics from './components/Statistics'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'

export type TimerState = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

const HeaderBar = memo(function HeaderBar({ onOpenStats, onOpenSettings, toggleTheme, theme }: {
  onOpenStats: () => void
  onOpenSettings: () => void
  toggleTheme: () => void
  theme: 'light' | 'dark'
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${theme === 'dark' ? 'bg-red-500/30' : 'bg-red-400'}`} />
        <span className={`h-3 w-3 rounded-full ${theme === 'dark' ? 'bg-yellow-500/30' : 'bg-yellow-400'}`} />
        <span className={`h-3 w-3 rounded-full ${theme === 'dark' ? 'bg-green-500/30' : 'bg-green-400'}`} />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenStats}
          className={`px-2 py-1 rounded-md text-sm ${
            theme === 'dark' ? 'text-amber-400 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
          aria-label="Statistics"
        >📊</button>
        <button
          onClick={onOpenSettings}
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
  )
})

const MiniProgress = memo(function MiniProgress({ cycleCount, theme }: { cycleCount: number, theme: 'light' | 'dark' }) {
  return (
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
  )
})

const Timer = () => {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const {
    status,
    timeLeft,
    cycleCount,
    start,
    pause,
    resetTimer,
    resetCycle,
    formatTime,
    label,
    todaySessions,
  } = usePomodoroTimer()

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
        <HeaderBar
          onOpenStats={() => setShowStatistics(true)}
          onOpenSettings={() => setShowSettings(true)}
          toggleTheme={toggleTheme}
          theme={theme}
        />

        {/* Main Content */}
        <div className="text-center select-none">
          <div className={`mb-2 text-xs tracking-widest uppercase ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            {label}
          </div>
          <div className={`${
            theme === 'dark' ? 'text-neutral-100' : 'text-neutral-800'
          } font-light font-mono tracking-tight text-6xl sm:text-7xl md:text-8xl`}>
            {formatTime(timeLeft)}
          </div>

          <div className={`mt-8 text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'}`}>
            {t('timer.session')} {cycleCount + 1} • {todaySessions} {t('timer.today')}
          </div>

          {/* Control Buttons */}
          <div className="space-y-3 mt-8">
            {status === 'idle' && (
              <button
                onClick={start}
                className={`w-full font-medium py-3 px-6 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                ▶️ {t('timer.start')}
              </button>
            )}

            {status === 'running' && (
              <button
                onClick={pause}
                className={`w-full font-medium py-3 px-6 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-600 hover:bg-amber-500 text-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                ⏸️ {t('timer.pause')}
              </button>
            )}

            {status === 'paused' && (
              <button
                onClick={start}
                className={`w-full font-medium py-3 px-6 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                ▶️ {t('timer.resume')}
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
                {t('timer.cancel')}
              </button>
              <button
                onClick={resetCycle}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {t('timer.newCycle')}
              </button>
            </div>
          </div>

          {/* Minimal Progress Indicator */}
          <MiniProgress cycleCount={cycleCount} theme={theme} />
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
