import { createI18n } from 'vue-i18n'
import zhHans from './zh-Hans.json'

const messages = {
  zhHans
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zhHans',
  fallbackLocale: 'zhHans',
  messages
})

export default i18n
