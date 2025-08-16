import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './contexts/ThemeContext'
import Settings from './components/Settings'
import Statistics from './components/Statistics'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'
import { useUpdateCheck } from './hooks/useUpdateCheck'

export type TimerState = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

const HeaderBar = memo(function HeaderBar({ onOpenStats, onOpenSettings, toggleTheme, theme }: {
  onOpenStats: () => void
  onOpenSettings: () => void
  toggleTheme: () => void
  theme: 'light' | 'dark'
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenStats}
          className={`h-8 w-8 inline-flex items-center justify-center rounded-full border text-sm shadow-sm transition-colors ${
            theme === 'dark'
              ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
              : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700'
          }`}
          aria-label={t('aria.statistics')}
        >
          {/* Bar chart icon */}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
            <rect x="3" y="10" width="4" height="10" rx="1" />
            <rect x="10" y="6" width="4" height="14" rx="1" />
            <rect x="17" y="3" width="4" height="17" rx="1" />
          </svg>
        </button>
        <button
          onClick={onOpenSettings}
          className={`h-8 w-8 inline-flex items-center justify-center rounded-full border text-sm shadow-sm transition-colors ${
            theme === 'dark'
              ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
              : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700'
          }`}
          aria-label={t('aria.settings')}
        >
          {/* Gear icon */}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
            <path d="M19.14 12.94a7.9 7.9 0 0 0 .05-.94 7.9 7.9 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.6 7.6 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.47 1h-3.94a.5.5 0 0 0-.5.43L8.67 3.97c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.12 7.49a.5.5 0 0 0 .12.64l2.03 1.58c-.03.31-.05.63-.05.94s.02.63.05.94L2.24 13.17a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.39 1.05.7 1.63.94l.36 2.54c.03.24.25.43.5.43h3.94c.25 0 .46-.19.5-.43l.36-2.54c.58-.24 1.13-.55 1.63-.94l2.39.96c.21.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/>
          </svg>
        </button>
        <button
          onClick={toggleTheme}
          className={`h-8 w-8 inline-flex items-center justify-center rounded-full border text-sm shadow-sm transition-colors ${
            theme === 'dark'
              ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-amber-400'
              : 'border-neutral-200 bg-white hover:bg-neutral-100 text-amber-500'
          }`}
          aria-label={t('aria.toggleTheme')}
        >
          {/* Sun / Moon icon simplified */}
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
              <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79Zm10.48 0 1.79-1.79 1.79 1.79-1.79 1.79-1.79-1.79ZM12 4V1h-0v3h0Zm0 19v-3h0v3h0ZM4 12H1v0h3v0Zm19 0h-3v0h3v0ZM6.76 19.16l-1.8 1.79-1.79-1.79 1.79-1.79 1.8 1.79ZM19.24 19.16l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
})

const MiniProgress = memo(function MiniProgress({ cycleCount, theme }: { cycleCount: number, theme: 'light' | 'dark' }) {
  return (
    <div className="mt-8">
      <div className="flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
  const { hasUpdate, latest } = useUpdateCheck()

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

  // Auto-update on startup (desktop/Tauri only)
  useEffect(() => {
    const pref = (() => {
      try { return localStorage.getItem('yupomo-auto-update') !== 'false' } catch { return true }
    })()
    if (!pref || !hasUpdate || !latest) return

    let cancelled = false
    ;(async () => {
      try {
        const { checkUpdate, installUpdate } = await import('@tauri-apps/api/updater')
        const info = await checkUpdate()
        if (!cancelled && info.shouldUpdate) {
          await installUpdate()
        }
      } catch {
        // Updater not available or running on web: no-op
      }
    })()

    return () => { cancelled = true }
  }, [hasUpdate, latest])

  return (
    <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center p-4`}>
      <div className={`rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 transition-colors duration-500 ${
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

        {/* Divider */}
        <div className={`${theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'} border-t opacity-60 mb-4`} />

        {/* Update Banner */}
        {hasUpdate && latest && (
          <div className={`mb-4 flex items-center justify-between rounded-lg px-3 py-2 text-sm border ${
            theme === 'dark'
              ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
              : 'bg-amber-50 border-amber-200 text-neutral-800'
          }`}>
            <div>
              <strong>{t('updates.bannerTitle')}</strong> {t('updates.bannerText', { latest: latest.latestVersion, current: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0' })}
            </div>
            <a
              href={latest.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme === 'dark' ? 'text-amber-400 hover:underline' : 'text-neutral-800 hover:underline'}`}
            >
              {t('updates.viewRelease')}
            </a>
          </div>
        )}

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
                className={`w-full font-medium py-3 px-6 rounded-2xl shadow-md transition-colors ${
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
                className={`w-full font-medium py-3 px-6 rounded-2xl shadow-md transition-colors ${
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
                className={`w-full font-medium py-3 px-6 rounded-2xl shadow-md transition-colors ${
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
