/**
 * Dev-gated logger. Debug/info output only appears in dev builds
 * (`import.meta.env.DEV`); warnings and errors always log.
 *
 * Never pass auth payloads, tokens, or credentials — not even to debug.
 */
const isDev = import.meta.env.DEV

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args)
  },
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
}
