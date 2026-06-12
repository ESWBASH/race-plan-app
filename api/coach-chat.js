export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  const { messages, context } = body
  if (!messages?.length) return res.status(400).json({ error: 'No messages' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  // Build rich system prompt from athlete context
  const { profile, races, recentRuns, checkIn, currentPhase, weekMiles, recentStrength } = context || {}

  const raceList = (races || [])
    .map(r => `${r.name} (${r.date}, ${r.distanceMi}mi, ${r.elevationFt}ft vert)`)
    .join('\n  ')

  const runList = (recentRuns || []).slice(0, 8)
    .map(r => `${r.date}: ${r.name} — ${r.miles}mi, ${r.elevFt}ft vert`)
    .join('\n  ')

  const strengthList = (recentStrength || []).length
    ? (recentStrength).map(s => `${s.date}: ${s.title} — ${s.exercises} (${s.sets} sets)`).join('\n  ')
    : 'No strength data connected'

  const checkInStr = checkIn
    ? `Legs: ${checkIn.legs}/5 | Sleep: ${checkIn.sleep}/5 | Stress: ${checkIn.stress}/5 | Motivation: ${checkIn.motivation}/5${checkIn.niggles ? ` | Niggles: ${checkIn.niggles}` : ''}${checkIn.feeling ? ` | Feeling: "${checkIn.feeling}"` : ''}`
    : 'No check-in data yet'

  const system = `You are a world-class ultra trail and fell running coach. You are direct, warm, specific, and deeply knowledgeable. You never give generic advice — everything is tailored to this athlete's actual data, races, and situation.

ATHLETE PROFILE:
- Level: ${profile?.level || 'ultra runner'}
- Goal: ${profile?.goal || '50k'}
- Training days/week: ${profile?.days || 4}
- Biggest challenge: ${profile?.gap || 'unknown'}
- Why they run: "${profile?.motivation || 'not specified'}"

UPCOMING RACES:
  ${raceList || 'No races listed'}

CURRENT PHASE: ${currentPhase || 'Training'}
MILES THIS WEEK: ${weekMiles || 0}

RECENT TRAINING (last 2 weeks):
  ${runList || 'No Strava data yet'}

RECENT STRENGTH SESSIONS (from Hevy):
  ${strengthList}

LATEST WEEKLY CHECK-IN:
  ${checkInStr}

COACHING RULES:
- Always use MILES not km
- This is trail/fell ultra running — never suggest road race approaches
- Be specific to their races, terrain, and goals (Peak District, Pennines, Yorkshire Dales)
- Keep responses concise — this is a mobile app, 3–5 sentences is ideal unless they need detail
- When they mention fatigue, pain or injury — be appropriately cautious and conservative
- Reference their specific races by name (Tittesworth, 5 Valleys, UTYD, Spine Sprint, The Lap)
- You know their WHY — use it when relevant to motivate or ground them
- Be honest. A good coach calls things out. Don't just validate.
- If they ask "should I run today?" — give a real yes/no with reasoning based on their data`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system,
        messages,
      }),
    })

    const data = await response.json()
    if (!data.content?.[0]?.text) {
      console.error('[coach-chat] API error:', JSON.stringify(data))
      return res.status(500).json({ error: 'No response from AI' })
    }

    res.status(200).json({ reply: data.content[0].text })
  } catch (err) {
    console.error('[coach-chat] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
