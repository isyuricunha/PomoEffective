import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Timer from './Timer'
import { ThemeProvider } from './contexts/ThemeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { StatisticsProvider } from './contexts/StatisticsContext'
import './App.css'

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.language || 'en'
    const rtl = ['ar', 'he', 'fa']
    const isRtl = rtl.some(code => lang.startsWith(code))
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
    }
  }, [i18n.language])

  return (
    <ThemeProvider>
      <SettingsProvider>
        <StatisticsProvider>
          <Timer />
        </StatisticsProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
