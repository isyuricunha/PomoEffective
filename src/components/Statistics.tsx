import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStatistics } from '../contexts/StatisticsContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface StatisticsProps {
  isOpen: boolean
  onClose: () => void
}

const Statistics = ({ isOpen, onClose }: StatisticsProps) => {
  const { t, i18n } = useTranslation()
  const { getDailyStats, getTotalSessions, getTodaySessions, getWeeklyTotal } = useStatistics()
  const { theme } = useTheme()
  const [viewPeriod, setViewPeriod] = useState<'week' | 'month'>('week')

  if (!isOpen) return null

  const days = viewPeriod === 'week' ? 7 : 30
  const dailyStats = useMemo(() => getDailyStats(days), [getDailyStats, days])
  
  const totalSessions = useMemo(() => getTotalSessions(), [getTotalSessions])
  const todaySessions = useMemo(() => getTodaySessions(), [getTodaySessions])
  const weeklyTotal = useMemo(() => getWeeklyTotal(), [getWeeklyTotal])

  // Chart colors based on theme
  const chartColors = {
    primary: theme === 'dark' ? '#fbbf24' : '#3b82f6',
    secondary: theme === 'dark' ? '#f59e0b' : '#10b981',
    tertiary: theme === 'dark' ? '#f97316' : '#8b5cf6',
    background: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    text: theme === 'dark' ? '#e5e7eb' : '#374151',
  }

  // Bar chart data for daily sessions
  const barChartData = useMemo(() => ({
    labels: dailyStats.map(stat => {
      const date = new Date(stat.date)
      return date.toLocaleDateString(i18n.language || undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: t('stats.dailyWorkSessions'),
        data: dailyStats.map(stat => stat.workSessions),
        backgroundColor: chartColors.background,
        borderColor: chartColors.primary,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }), [dailyStats, i18n.language, chartColors.background, chartColors.primary, t])

  // Line chart data for work time
  const lineChartData = useMemo(() => ({
    labels: dailyStats.map(stat => {
      const date = new Date(stat.date)
      return date.toLocaleDateString(i18n.language || undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: t('stats.dailyWorkTime'),
        data: dailyStats.map(stat => stat.totalWorkTime),
        borderColor: chartColors.secondary,
        backgroundColor: chartColors.background,
        tension: 0.4,
        fill: true,
      },
    ],
  }), [dailyStats, i18n.language, chartColors.secondary, chartColors.background, t])

  // Doughnut chart for session types
  const { totalWorkSessions, totalShortBreaks, totalLongBreaks } = useMemo(() => ({
    totalWorkSessions: dailyStats.reduce((sum, stat) => sum + stat.workSessions, 0),
    totalShortBreaks: dailyStats.reduce((sum, stat) => sum + stat.shortBreaks, 0),
    totalLongBreaks: dailyStats.reduce((sum, stat) => sum + stat.longBreaks, 0),
  }), [dailyStats])

  const doughnutData = useMemo(() => ({
    labels: [t('stats.dailyWorkSessions'), t('labels.shortBreak'), t('labels.longBreak')],
    datasets: [
      {
        data: [totalWorkSessions, totalShortBreaks, totalLongBreaks],
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
        ],
        borderWidth: 0,
      },
    ],
  }), [t, totalWorkSessions, totalShortBreaks, totalLongBreaks, chartColors.primary, chartColors.secondary, chartColors.tertiary])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartColors.text,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.text,
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: chartColors.text,
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: chartColors.text,
          padding: 20,
        },
      },
    },
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-neutral-950 border border-neutral-800'
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-amber-400' : 'text-gray-800'
          }`}>
            {t('stats.title')}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'text-neutral-400 hover:bg-neutral-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
          }`}>
            <div className="text-center">
              <div className={`font-mono tabular-nums text-4xl md:text-5xl font-semibold ${
                theme === 'dark' ? 'text-amber-400' : 'text-blue-600'
              }`}>
                {todaySessions}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('stats.today')}
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
          }`}>
            <div className="text-center">
              <div className={`font-mono tabular-nums text-4xl md:text-5xl font-semibold ${
                theme === 'dark' ? 'text-amber-400' : 'text-blue-600'
              }`}>
                {weeklyTotal}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('stats.thisWeek')}
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
          }`}>
            <div className="text-center">
              <div className={`font-mono tabular-nums text-4xl md:text-5xl font-semibold ${
                theme === 'dark' ? 'text-amber-400' : 'text-blue-600'
              }`}>
                {totalSessions}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('stats.totalSessions')}
              </div>
            </div>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex justify-center mb-6">
          <div className={`flex rounded-lg p-1 ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setViewPeriod('week')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewPeriod === 'week'
                  ? theme === 'dark'
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('period.days7')}
            </button>
            <button
              onClick={() => setViewPeriod('month')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewPeriod === 'month'
                  ? theme === 'dark'
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('period.days30')}
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sessions Chart */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-neutral-200' : 'text-gray-700'
            }`}>
              {t('stats.dailyWorkSessions')}
            </h3>
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>

          {/* Work Time Chart */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-neutral-200' : 'text-gray-700'
            }`}>
              {t('stats.dailyWorkTime')}
            </h3>
            <div className="h-64">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Session Types Distribution */}
          <div className={`p-4 rounded-xl lg:col-span-2 ${
            theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 text-center ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {t('stats.sessionDistribution')} ({viewPeriod === 'week' ? t('stats.last7') : t('stats.last30')})
            </h3>
            <div className="h-64 flex justify-center">
              <div className="w-64">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className={`mt-6 p-4 rounded-xl ${
          theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            📈 {t('stats.insights')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <strong>{t('stats.avgDailySessions')}</strong> {(totalWorkSessions / days).toFixed(1)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <strong>{t('stats.totalFocusTime')}</strong> {Math.floor(dailyStats.reduce((sum, stat) => sum + stat.totalWorkTime, 0) / 60)}h {dailyStats.reduce((sum, stat) => sum + stat.totalWorkTime, 0) % 60}m
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
