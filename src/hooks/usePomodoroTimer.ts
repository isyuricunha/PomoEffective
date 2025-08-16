import { useEffect, useMemo, useReducer, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../contexts/SettingsContext'
import { useStatistics } from '../contexts/StatisticsContext'
import { sendNotification, playNotificationSound } from '../utils/notifications'

export type TimerState = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

interface TimerConfig {
  work: number
  shortBreak: number
  longBreak: number
}

interface TimerPersistedState {
  state: TimerState
  status: TimerStatus
  endTime: number | null
  timeLeft: number
  cycleCount: number
}

type Action =
  | { type: 'INIT'; payload: Partial<TimerPersistedState> }
  | { type: 'SET_STATE'; payload: TimerState }
  | { type: 'SET_STATUS'; payload: TimerStatus }
  | { type: 'SET_TIMELEFT'; payload: number }
  | { type: 'SET_ENDTIME'; payload: number | null }
  | { type: 'INC_CYCLE' }
  | { type: 'RESET_CYCLE' }

const STORAGE_KEY = 'pomodoro-active-state'

const initialState: TimerPersistedState = {
  state: 'work',
  status: 'idle',
  endTime: null,
  timeLeft: 0,
  cycleCount: 0,
}

export const usePomodoroTimer = () => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { addSession, getTodaySessions } = useStatistics()

  const timerConfig: TimerConfig = useMemo(
    () => ({
      work: settings.work * 60,
      shortBreak: settings.shortBreak * 60,
      longBreak: settings.longBreak * 60,
    }),
    [settings]
  )

  function reducer(state: TimerPersistedState, action: Action): TimerPersistedState {
    switch (action.type) {
      case 'INIT':
        return { ...state, ...action.payload }
      case 'SET_STATE':
        return { ...state, state: action.payload }
      case 'SET_STATUS':
        return { ...state, status: action.payload }
      case 'SET_TIMELEFT':
        return { ...state, timeLeft: action.payload }
      case 'SET_ENDTIME':
        return { ...state, endTime: action.payload }
      case 'INC_CYCLE':
        return { ...state, cycleCount: state.cycleCount + 1 }
      case 'RESET_CYCLE':
        return { ...state, cycleCount: 0 }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  const tickRef = useRef<number | null>(null)
  const hasCompletedOnRestoreRef = useRef(false)

  // Initialize defaults based on settings when idle
  useEffect(() => {
    if (state.status === 'idle') {
      const base = timerConfig[state.state]
      if (state.timeLeft === 0 || state.timeLeft !== base) {
        dispatch({ type: 'SET_TIMELEFT', payload: base })
      }
    }
  }, [timerConfig, state.status, state.state, state.timeLeft])

  // Persistence
  useEffect(() => {
    const toSave: TimerPersistedState = state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // ignore storage quota or privacy mode errors
    }
  }, [state])

  useEffect(() => {
    // restore once on mount
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as TimerPersistedState
        // Recompute timeLeft if running
        if (saved.status === 'running' && saved.endTime) {
          const diff = Math.max(0, Math.floor((saved.endTime - Date.now()) / 1000))
          saved.timeLeft = diff
          if (diff === 0) {
            // trigger completion once after restoring
            hasCompletedOnRestoreRef.current = true
          }
        }
        dispatch({ type: 'INIT', payload: saved })
      } else {
        // initialize timeLeft
        dispatch({ type: 'SET_TIMELEFT', payload: timerConfig.work })
      }
    } catch {
      dispatch({ type: 'SET_TIMELEFT', payload: timerConfig.work })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tick loop
  useEffect(() => {
    if (state.status === 'running' && state.endTime) {
      tickRef.current = window.setInterval(() => {
        const remaining = Math.max(0, Math.floor((state.endTime! - Date.now()) / 1000))
        if (remaining === 0) {
          clearInterval(tickRef.current!)
          tickRef.current = null
          void handleComplete()
        } else {
          dispatch({ type: 'SET_TIMELEFT', payload: remaining })
        }
      }, 250)
    }
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current)
        tickRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.endTime])

  // Handle completion after restore if needed
  useEffect(() => {
    if (hasCompletedOnRestoreRef.current) {
      hasCompletedOnRestoreRef.current = false
      void handleComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.state])

  const start = () => {
    if (state.status === 'running') return
    const end = Date.now() + state.timeLeft * 1000
    dispatch({ type: 'SET_ENDTIME', payload: end })
    dispatch({ type: 'SET_STATUS', payload: 'running' })
  }

  const pause = () => {
    if (state.status !== 'running') return
    const remaining = Math.max(0, Math.floor(((state.endTime ?? Date.now()) - Date.now()) / 1000))
    dispatch({ type: 'SET_STATUS', payload: 'paused' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'SET_TIMELEFT', payload: remaining })
  }

  const resetTimer = () => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'SET_TIMELEFT', payload: timerConfig[state.state] })
  }

  const resetCycle = () => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' })
    dispatch({ type: 'SET_STATE', payload: 'work' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'RESET_CYCLE' })
    dispatch({ type: 'SET_TIMELEFT', payload: timerConfig.work })
  }

  const nextState = (current: TimerState, nextCycleCount: number): TimerState => {
    if (current === 'work') {
      return nextCycleCount % 4 === 0 ? 'longBreak' : 'shortBreak'
    }
    return 'work'
  }

  const handleComplete = async () => {
    // record completed session
    const sessionDuration = state.state === 'work' ? settings.work : state.state === 'shortBreak' ? settings.shortBreak : settings.longBreak
    addSession(state.state, sessionDuration)

    // notify
    if (settings.notificationsEnabled) {
      try {
        await sendNotification({
          title: t('app.title'),
          body: t('timer.completed', {
            label: state.state === 'work' ? t('labels.focus') : state.state === 'shortBreak' ? t('labels.shortBreak') : t('labels.longBreak'),
            next: state.state === 'work' ? t('timer.next_break') : t('timer.next_focus')
          })
        })
      } catch {
        // best-effort notification; ignore failures
      }
    }
    if (settings.soundEnabled) {
      try { playNotificationSound() } catch {
        // best-effort sound; ignore failures
      }
    }

    // transition
    let nextCycle = state.cycleCount
    if (state.state === 'work') {
      nextCycle = state.cycleCount + 1
      dispatch({ type: 'INC_CYCLE' })
    }
    const ns = nextState(state.state, nextCycle)
    dispatch({ type: 'SET_STATUS', payload: 'idle' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'SET_STATE', payload: ns })
    dispatch({ type: 'SET_TIMELEFT', payload: timerConfig[ns] })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    state: state.state,
    status: state.status,
    timeLeft: state.timeLeft,
    cycleCount: state.cycleCount,
    start,
    pause,
    resetTimer,
    resetCycle,
    formatTime,
    label: state.state === 'work' ? t('labels.focus') : state.state === 'shortBreak' ? t('labels.shortBreak') : t('labels.longBreak'),
    todaySessions: getTodaySessions(),
  }
}
