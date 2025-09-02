import autoprefixer from 'autoprefixer'
import darkClass from 'postcss-dark-theme-class'
import type { Config } from 'postcss-load-config'

export default {
  plugins: [autoprefixer(), darkClass()]
} satisfies Config
