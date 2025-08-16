import { useEffect, useState } from 'react'
import { compareSemver, fetchLatestRelease, type LatestInfo } from '../utils/version'

interface UpdateState {
  hasUpdate: boolean
  latest?: LatestInfo
}

const LS_KEY = 'yupomo-last-update-check'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function useUpdateCheck() : UpdateState {
  const [state, setState] = useState<UpdateState>({ hasUpdate: false })

  useEffect(() => {
    // throttle checks to once per day
    try {
      const last = Number(localStorage.getItem(LS_KEY) || '0')
      if (Date.now() - last < ONE_DAY_MS) return
    } catch {/* ignore */}

    let aborted = false
    ;(async () => {
      const latest = await fetchLatestRelease('isyuricunha', 'YuPomo')
      if (!latest || aborted) return
      const cur = (typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0')
      const cmp = compareSemver(cur, latest.latestVersion)
      if (cmp < 0) {
        setState({ hasUpdate: true, latest })
      }
      try { localStorage.setItem(LS_KEY, String(Date.now())) } catch {/* ignore */}
    })()

    return () => { aborted = true }
  }, [])

  return state
}
