import Timer from './Timer'
import { ThemeProvider } from './contexts/ThemeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { StatisticsProvider } from './contexts/StatisticsContext'
import './App.css'

function App() {
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
