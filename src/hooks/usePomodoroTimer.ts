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

  const playEventSound = (event: 'start' | 'pause' | 'workToBreak' | 'breakToWork' | 'newCycle' | 'cancel' | 'complete') => {
    if (!settings.soundEnabled) return
    const volume = settings.soundVolume ?? 0.3
    let file: string | undefined
    switch (event) {
      case 'start':
        file = '/sounds/start.mp3'
        break
      case 'pause':
        file = '/sounds/pause.mp3'
        break
      case 'workToBreak':
        file = '/sounds/break.mp3'
        break
      case 'breakToWork':
        file = '/sounds/end-break.mp3'
        break
      case 'newCycle':
        file = '/sounds/new-cycle.mp3'
        break
      case 'cancel':
        file = '/sounds/cancel.mp3'
        break
      case 'complete':
        file = '/sounds/complete.mp3'
        break
    }
    try {
      playNotificationSound({ volume, sourceUrl: file })
    } catch {
      // ignore
    }
  }

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

  // Lazy-init to avoid initial 00:00 flash by seeding with current settings
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (s) => ({ ...s, timeLeft: settings.work * 60 })
  )
  const tickRef = useRef<number | null>(null)
  const hasCompletedOnRestoreRef = useRef(false)

  const parsePersisted = (input: unknown): Partial<TimerPersistedState> => {
    if (typeof input !== 'object' || input === null) return {}
    const o = input as Record<string, unknown>
    const s = o.state
    const st = o.status
    const validState: TimerState | undefined = s === 'work' || s === 'shortBreak' || s === 'longBreak' ? s : undefined
    const validStatus: TimerStatus | undefined = st === 'idle' || st === 'running' || st === 'paused' ? st : undefined
    const endTime = typeof o.endTime === 'number' ? o.endTime : null
    const timeLeft = typeof o.timeLeft === 'number' && o.timeLeft >= 0 ? o.timeLeft : undefined
    const cycleCount = typeof o.cycleCount === 'number' && o.cycleCount >= 0 ? o.cycleCount : undefined
    return {
      state: validState,
      status: validStatus,
      endTime,
      timeLeft,
      cycleCount,
    }
  }

  // Initialize defaults based on settings when idle (only if empty)
  useEffect(() => {
    if (state.status === 'idle') {
      const base = timerConfig[state.state]
      if (state.timeLeft === 0) {
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
        const savedUnknown = JSON.parse(raw) as unknown
        const savedPartial = parsePersisted(savedUnknown)
        const saved: TimerPersistedState = {
          ...initialState,
          ...savedPartial,
        }
        // Recompute timeLeft if running
        if (saved.status === 'running' && saved.endTime) {
          const diff = Math.max(0, Math.floor((saved.endTime - Date.now()) / 1000))
          saved.timeLeft = diff
          if (diff === 0) {
            const overdueSec = Math.floor((Date.now() - saved.endTime) / 1000)
            // If state is overly stale (e.g., reopened long after end), reset cleanly instead of auto-completing
            if (overdueSec > 30) {
              dispatch({ type: 'INIT', payload: {
                state: 'work',
                status: 'idle',
                endTime: null,
                timeLeft: timerConfig.work,
                cycleCount: 0,
              } })
              return
            }
            // trigger completion once after restoring (freshly ended)
            hasCompletedOnRestoreRef.current = true
          }
        }
        dispatch({ type: 'INIT', payload: saved })
      } else {
        // initialize full default state cleanly for first-time users
        dispatch({ type: 'INIT', payload: {
          state: 'work',
          status: 'idle',
          endTime: null,
          timeLeft: timerConfig.work,
          cycleCount: 0,
        } })
      }
    } catch {
      // on parse error, reset to clean defaults
      dispatch({ type: 'INIT', payload: {
        state: 'work',
        status: 'idle',
        endTime: null,
        timeLeft: timerConfig.work,
        cycleCount: 0,
      } })
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
    // start sound
    playEventSound('start')
  }

  const pause = () => {
    if (state.status !== 'running') return
    const remaining = Math.max(0, Math.floor(((state.endTime ?? Date.now()) - Date.now()) / 1000))
    dispatch({ type: 'SET_STATUS', payload: 'paused' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'SET_TIMELEFT', payload: remaining })
    // pause sound
    playEventSound('pause')
  }

  const resetTimer = () => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'SET_TIMELEFT', payload: timerConfig[state.state] })
    // cancel sound
    playEventSound('cancel')
  }

  const resetCycle = () => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' })
    dispatch({ type: 'SET_STATE', payload: 'work' })
    dispatch({ type: 'SET_ENDTIME', payload: null })
    dispatch({ type: 'RESET_CYCLE' })
    dispatch({ type: 'SET_TIMELEFT', payload: timerConfig.work })
    // cancel sound
    playEventSound('cancel')
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
    // Determine next state and play appropriate sound
    // Always play completion sound first
    playEventSound('complete')
    let nextCycle = state.cycleCount
    if (state.state === 'work') {
      nextCycle = state.cycleCount + 1
    }
    const ns = nextState(state.state, nextCycle)
    // If starting a long break (every 4th work completion), use new-cycle
    if (state.state === 'work' && ns === 'longBreak') {
      playEventSound('newCycle')
    } else if (state.state === 'work') {
      playEventSound('workToBreak')
    } else {
      playEventSound('breakToWork')
    }

    // transition
    // transition
    nextCycle = state.cycleCount
    if (state.state === 'work') {
      nextCycle = state.cycleCount + 1
      dispatch({ type: 'INC_CYCLE' })
    }
    // ns already computed above
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
