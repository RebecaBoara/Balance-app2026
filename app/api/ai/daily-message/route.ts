/**
 * POST /api/ai/daily-message
 *
 * Generates mood-aware AI content using OpenAI GPT-4o-mini.
 * Runs server-side only and requires a verified Firebase ID token.
 */
import { NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'

type DailyMessageRequest = {
  mood?: string | null
}

type MoodFallback = {
  spark: string
  suggestion: string
}

type ApiPayload = {
  spark: string
  suggestion: string
  source: 'ai' | 'fallback'
}

const ALLOWED_MOODS = new Set(['exhausted', 'stressed', 'neutral', 'good', 'energised', 'general'])
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const rateBuckets = new Map<string, number[]>()

const FALLBACKS: Record<string, MoodFallback> = {
  exhausted: {
    spark: "One step at a time is still forward. You've got this.",
    suggestion:
      "You're doing enough. Start with one small task to build momentum — even one thing crossed off makes the day count. Try 15 minutes on, 10 minutes off to protect your energy.",
  },
  stressed: {
    spark: 'Stress is temporary. Focus on one thing at a time and keep moving.',
    suggestion:
      "Take a breath. Pick one task, give it your full attention, then move to the next. Short breaks between tasks reset your focus — even 2–3 minutes helps.",
  },
  neutral: {
    spark: 'Steady progress is still progress. Keep going.',
    suggestion:
      'A steady day ahead. A mix of easy and medium tasks will keep things moving. Take a short break after every two tasks to stay fresh.',
  },
  good: {
    spark: 'Great days like this are when the best work happens. Make the most of it.',
    suggestion:
      "You're in a good place today — tackle something meaningful. Take breaks when you feel it, not on a timer.",
  },
  energised: {
    spark: "You've got everything you need today. Go make something remarkable.",
    suggestion:
      "You're at your peak — this is your moment for the hard, ambitious work. Short breaks every 90 minutes will sustain this energy.",
  },
}

function fallback(mood?: string | null): MoodFallback {
  if (!mood) {
    return {
      spark: 'Steady progress is still progress. Keep going.',
      suggestion: '',
    }
  }
  return FALLBACKS[mood ?? ''] ?? {
    spark: 'Steady progress is still progress. Keep going.',
    suggestion: '',
  }
}

function json(payload: MoodFallback, source: 'ai' | 'fallback'): NextResponse<ApiPayload> {
  return NextResponse.json({ ...payload, source }, { status: 200 })
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown-ip'
}

function hitRateLimit(key: string): boolean {
  const now = Date.now()
  const recent = (rateBuckets.get(key) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS)
  recent.push(now)
  rateBuckets.set(key, recent)
  return recent.length > RATE_LIMIT_MAX
}

async function verifyFirebaseIdToken(idToken: string): Promise<string | null> {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    return decoded.uid
  } catch {
    return null
  }
}

async function callOpenAIWithRetry(
  apiKey: string,
  normalizedMood: string
): Promise<{ spark?: string; suggestion?: string } | null> {
 const systemPrompt =
  'You are the voice of Balance, a mood-aware productivity app. ' +
  'Generate two pieces of content based on the user\'s mood.\n\n' +
  
  'DAILY SPARK — one warm, universal affirmation (12–18 words). ' +
  'This is mood-independent — it should work for anyone on any day. ' +
  'Style: concise, grounding, honest — like something a trusted friend would say. Not a poster slogan.\n' +
  'Good examples:\n' +
  '"Steady progress is still progress. Keep going."\n' +
  '"Rest is not giving up — it\'s part of the process."\n' +
  '"Today doesn\'t have to be perfect to be worthwhile."\n' +
  '"One step at a time is still forward."\n' +
  '"Small things done consistently matter more than big things done rarely."\n' +
  '"Showing up is already half the work."\n' +
  '"You don\'t need to do everything — just the next thing."\n' +
  'Bad examples (too generic): "Believe in yourself!", "You\'ve got this!", "Make today count!", "You are enough!"\n\n' +
  
  'SUGGESTION — 2–3 warm sentences (~35–45 words total) based on the selected mood. ' +
  'First sentence: a warm, practical nudge for the day. ' +
  'Last sentence: a brief, specific break tip for their energy level. ' +
  'Never list tasks. Never say "only do easy tasks". Never give medical advice. ' +
  'Tone: kind, personal, like a trusted friend — not a productivity coach.\n\n' +
  
  'EXACT STYLE EXAMPLES to match (these are the gold standard):\n' +
  'exhausted → "You\'re doing enough. Start with one small thing to build momentum — even one task crossed off makes the day count. Try 15 minutes on, 10 minutes off to protect your energy."\n' +
  'stressed → "Take a breath — the pressure is real, but so is your ability to handle it. Give one task your full attention, then move to the next. Short 2–3 minute breaks between tasks will reset your focus."\n' +
  'neutral → "A steady day ahead — no pressure to overdo it. A balanced pace will keep things moving without draining you. Take a short break after every two tasks to stay sharp."\n' +
  'good → "You\'re in a good place today. Channel that into something meaningful — the kind of work that matters to you. Take a break when you feel it, not on a timer."\n' +
  'energised → "You\'re at your peak — this is the time for your hardest, most ambitious work. Make the most of this energy while it\'s here. A short break every 90 minutes will sustain it."\n\n' +
  
  'MOOD GUIDANCE:\n' +
  '- exhausted: gentle, validating. Acknowledge they may be running low. Light nudge to start somewhere small.\n' +
  '- stressed: calm, grounding. Acknowledge the pressure without amplifying it. One thing at a time.\n' +
  '- neutral: balanced, steady. Not overly positive, not cautious. Just a good, productive day.\n' +
  '- good: warm, affirming. Encourage them to channel their positive state into meaningful work.\n' +
  '- energised: enthusiastic but not hyperactive. This is their peak — acknowledge and harness it.\n' +
  '- general: warm and open — no mood is known yet. Keep the suggestion brief and universally applicable.\n\n' +

  'IMPORTANT: Do not copy the example phrases verbatim. Generate fresh, original wording each time.\n\n' +

  'Return ONLY valid JSON: { "spark": "string", "suggestion": "string" }\n' +
  'spark is always mood-independent. suggestion is always mood-specific.';

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `mood: ${normalizedMood}` },
          ],
          max_tokens: 250,
          temperature: 0.8,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        if (attempt === 0) continue
        return null
      }

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
      const text = data.choices?.[0]?.message?.content ?? ''
      return JSON.parse(text) as { spark?: string; suggestion?: string }
    } catch {
      if (attempt === 1) return null
    } finally {
      clearTimeout(timeout)
    }
  }

  return null
}

export async function POST(req: Request) {
  let body: DailyMessageRequest = {}
  try {
    body = (await req.json()) as DailyMessageRequest
  } catch {
    return json(fallback('general'), 'fallback')
  }

  const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization')
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const uid = idToken ? await verifyFirebaseIdToken(idToken) : null
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientKey = `${uid}:${getClientIp(req)}`
  if (hitRateLimit(clientKey)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const incomingMood = typeof body.mood === 'string' ? body.mood.toLowerCase() : 'general'
  const normalizedMood = ALLOWED_MOODS.has(incomingMood) ? incomingMood : 'general'
  const fallbackMood = normalizedMood === 'general' ? null : normalizedMood

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return json(fallback(fallbackMood), 'fallback')

  const aiResult = await callOpenAIWithRetry(apiKey, normalizedMood)
  if (!aiResult) return json(fallback(fallbackMood), 'fallback')

  const fb = fallback(fallbackMood)
  return json(
    {
      spark: aiResult.spark || fb.spark,
      suggestion: aiResult.suggestion ?? fb.suggestion,
    },
    'ai'
  )
}
