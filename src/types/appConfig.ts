
interface ServerConfig {
  host: string
  port: number
}

interface FeaturesConfig {
  dark_mode: boolean
  analytics: boolean
}

interface AppConfig {
  title: string
  author: string
  description: string
  server: ServerConfig
  features: FeaturesConfig
}

export type { AppConfig }
