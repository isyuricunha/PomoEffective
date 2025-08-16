import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
    },
    lng: (typeof window !== 'undefined' && (localStorage.getItem('lang') || (navigator.language || 'en').startsWith('pt') ? 'pt-BR' : 'en')) || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
