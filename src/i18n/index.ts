import { createI18n } from 'vue-i18n'
import zhHans from './zh-Hans.json'
import zhHant from './zh-Hant.json'
import en from './en.json'
import ja from './ja.json'

const messages = {
  zhHans,
  zhHant,
  en,
  ja
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zhHans',
  fallbackLocale: 'en',
  messages
})

export default i18n
