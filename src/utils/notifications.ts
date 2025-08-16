// Notification utilities for both web and Tauri environments

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
}

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined
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
      const { sendNotification } = await import('@tauri-apps/api/notification')
      await sendNotification({
        title: options.title,
        body: options.body,
        icon: options.icon,
      })
    } else {
      // Use web notification
      if (await requestNotificationPermission()) {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/vite.svg',
        })
      }
    }
  } catch (error) {
    console.warn('Failed to send notification:', error)
  }
}

// Play notification sound
export const playNotificationSound = (): void => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configure sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz frequency
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime) // 30% volume
    
    // Play for 200ms
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
  } catch (error) {
    console.warn('Failed to play notification sound:', error)
  }
}
