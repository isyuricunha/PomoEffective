// Notification utilities for both web and Tauri environments

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
}

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

// Request notification permission for web
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Send notification (works for both web and Tauri)
export const sendNotification = async (options: NotificationOptions): Promise<void> => {
  try {
    if (isTauri()) {
      // Use Tauri notification
      const { sendNotification: tauriSendNotification } = await import('@tauri-apps/api/notification')
      tauriSendNotification({
        title: options.title,
        body: options.body,
        icon: options.icon,
      })
    } else {
      // Use web notification
      if (await requestNotificationPermission()) {
        new Notification(options.title, {
          body: options.body,
          // Prefer provided icon; otherwise let the platform/browser default icon be used
          icon: options.icon,
        })
      }
    }
  } catch (error) {
    console.warn('Failed to send notification:', error)
  }
}

// Play notification sound
export interface PlaySoundOptions {
  volume?: number // 0..1
  sourceUrl?: string // if provided, play this file instead of the beep
}

export const playNotificationSound = (options?: PlaySoundOptions): void => {
  try {
    // If a custom source URL is provided, play it via HTMLAudio for maximum compatibility
    if (options?.sourceUrl) {
      const audio = new Audio(options.sourceUrl)
      audio.volume = Math.min(1, Math.max(0, options.volume ?? 0.3))
      void audio.play().catch(() => { /* ignore */ })
      return
    }

    // Reuse a single AudioContext and try to resume if suspended
    const getAudioContext = (): AudioContext | undefined => {
      const w = window as unknown as {
        AudioContext?: typeof AudioContext
        webkitAudioContext?: typeof AudioContext
        __yupomoAudioCtx?: AudioContext
      }
      const Ctor = w.AudioContext ?? w.webkitAudioContext
      if (!Ctor) return undefined
      if (!w.__yupomoAudioCtx) {
        try { w.__yupomoAudioCtx = new Ctor() } catch { return undefined }
      }
      return w.__yupomoAudioCtx
    }

    const ctx = getAudioContext()
    if (!ctx) return

    // Best-effort resume (autoplay policy)
    if (typeof ctx.resume === 'function' && ctx.state === 'suspended') {
      void ctx.resume().catch(() => { /* ignore */ })
    }

    // Create oscillator for beep sound
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Configure sound
    oscillator.frequency.setValueAtTime(800, ctx.currentTime) // 800Hz frequency
    const vol = Math.min(1, Math.max(0, options?.volume ?? 0.3))
    gainNode.gain.setValueAtTime(vol, ctx.currentTime)

    // Play for 200ms
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
  } catch (error) {
    console.warn('Failed to play notification sound:', error)
  }
}
