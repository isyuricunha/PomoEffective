// Type declarations for Tauri
declare global {
  interface Window {
    __TAURI__?: {
      [key: string]: any
    }
  }
}

export {}
