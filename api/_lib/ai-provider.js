import { susunLogbookDenganGemini } from './gemini.js'
import { susunLogbookDenganOpenRouter } from './openrouter.js'
import { susunLogbookDenganGroq } from './groq.js'

export function providerAktif(env) {
  return (env.AI_PROVIDER || 'groq').toLowerCase()
}

export async function susunLogbookAi(env, opts) {
  const provider = providerAktif(env)
  if (provider === 'groq') return susunLogbookDenganGroq(env, opts)
  if (provider === 'openrouter') return susunLogbookDenganOpenRouter(env, opts)
  if (provider === 'gemini') return susunLogbookDenganGemini(env, opts)
  throw new Error('AI_PROVIDER tidak dikenal: ' + provider + '. Gunakan "groq", "openrouter", atau "gemini".')
}