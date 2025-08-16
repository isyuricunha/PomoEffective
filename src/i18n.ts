import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import ru from './locales/ru.json'
import ja from './locales/ja.json'
import zhCN from './locales/zh-CN.json'

const detectLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('lang')
  if (stored) return stored
  const nav = navigator.language || 'en'
  const base = nav.split('-')[0]
  const map: Record<string, string> = {
    en: 'en',
    pt: 'pt-BR',
    es: 'es',
    fr: 'fr',
    de: 'de',
    it: 'it',
    ru: 'ru',
    ja: 'ja',
    zh: 'zh-CN',
  }
  return map[base] || 'en'
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      ru: { translation: ru },
      ja: { translation: ja },
      'zh-CN': { translation: zhCN },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
