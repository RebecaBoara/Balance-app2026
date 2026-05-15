/**
 * POST /api/ai/daily-message
 *
 * Generates mood-aware AI content using OpenAI GPT-4o-mini.
 * Runs server-side only — OPENAI_API_KEY is never exposed to the client.
 *
 * Accepts: { mood: string }
 * Returns: { spark: string, suggestion: string }
 *   - spark      : short inspirational quote for the Daily Spark card
 *   - suggestion : longer, warm, actionable message for the Balance Suggests banner
 *
 * Falls back to hardcoded strings if the API key is missing or the call fails.
 */
import { NextResponse } from 'next/server'

type DailyMessageRequest = {
  mood?: string | null
}

type MoodFallback = { spark: string; suggestion: string }

const FALLBACKS: Record<string, MoodFallback> = {
  exhausted: {
    spark:      "It's okay to take it slow today. Three small wins is a great day.",
    suggestion: "You seem tired today. Start with just one or two easy tasks and be gentle with yourself — rest is productive too. Take a longer break between each task, and don't add anything new to your plate today.",
  },
  stressed: {
    spark:      'Stress is temporary. Focus on one small thing at a time.',
    suggestion: "You seem stressed. Stick to light, easy tasks today and avoid setting new deadlines. A short breathing break between each task can help reset your focus — your wellbeing always comes first, before the to-do list.",
  },
  neutral: {
    spark:      'Steady progress is still progress. Keep going.',
    suggestion: "A steady day ahead. A balanced mix of easy and medium tasks will keep things moving without overwhelming you. Take a short break after every two tasks to maintain focus and keep your energy consistent throughout the day.",
  },
  good: {
    spark:      "Great days like this are when the best work happens. Make the most of it.",
    suggestion: "You're in a good place today — your full task list is unlocked. Use this momentum to tackle something meaningful or make progress on a goal you've been putting off. Take breaks when you feel it, not on a timer.",
  },
  energised: {
    spark:      "You've got everything you need today. Go make something remarkable.",
    suggestion: "You're at your peak! This is the time for your hardest, most ambitious tasks — the ones that need your full focus and creativity. Short breaks every 90 minutes will help you sustain this energy all the way through.",
  },
}

function fallback(mood?: string | null): MoodFallback {
  return FALLBACKS[mood ?? ''] ?? {
    spark:      'Steady progress is still progress. Keep going.',
    suggestion: 'Start with one small win and build momentum from there. Every step forward counts, no matter how small.',
  }
}

export async function POST(req: Request) {
  let body: DailyMessageRequest = {}
  try {
    body = (await req.json()) as DailyMessageRequest
  } catch {
    return NextResponse.json(fallback(), { status: 200 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json(fallback(body.mood), { status: 200 })

  const systemPrompt =
    'You are a warm, encouraging wellness coach inside a mood-aware productivity app called Balance. ' +
    'The user has just selected their mood for the day. Generate two pieces of content tailored to that mood:\n\n' +
    '1. spark: A short, inspiring quote or affirmation (15–20 words). Personal, uplifting, specific to the mood. Written as a statement, not a question.\n' +
    '2. suggestion: A warm, practical suggestion (50–65 words). Acknowledge how they feel, then advise specifically on what kind of tasks to focus on and how many to attempt today. Keep it task-focused — do NOT suggest breathing exercises, meditation, or wellness activities as those are handled separately in the app. Encouraging but realistic.\n\n' +
    'Mood guidance:\n' +
    '- no mood / general: warm and welcoming. A gentle, positive message to start the day — no task advice.\n' +
    '- exhausted: gentle tone. Suggest 1–2 easy tasks max, protect their energy, no pressure.\n' +
    '- stressed: calm tone. Easy tasks only, avoid new deadlines, keep the list short.\n' +
    '- neutral: balanced tone. Mix of easy and medium tasks, up to 5, steady pace.\n' +
    '- good: warm tone. Full task list available, tackle something meaningful.\n' +
    '- energised: enthusiastic tone. Hard tasks first, ambitious goals, make the most of it.\n\n' +
    'When mood is "general" or null, set suggestion to empty string and spark to a warm general message only.\n' +
    'Return ONLY valid JSON with exactly two keys: spark (string) and suggestion (string). Never give medical advice.'

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
          { role: 'user',   content: `mood: ${body.mood ?? 'neutral'}` },
        ],
        max_tokens: 250,
        temperature: 0.8,
      }),
    })

    if (!res.ok) return NextResponse.json(fallback(body.mood), { status: 200 })

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[]
    }
    const text   = data.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(text) as { spark?: string; suggestion?: string }
    const fb     = fallback(body.mood)

    return NextResponse.json({
      spark:      parsed.spark      || fb.spark,
      suggestion: parsed.suggestion || fb.suggestion,
    })
  } catch {
    return NextResponse.json(fallback(body.mood), { status: 200 })
  }
}
