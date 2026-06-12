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

  const {
    profile, races, recentRuns, checkIn, checkinTrend,
    niggleHistory, debriefMemory, currentPhase, brainReadiness, weekMiles, recentStrength
  } = context || {}

  const raceList = (races || [])
    .map(r => `${r.name} (${r.date}, ${r.distanceMi}mi, ${r.elevationFt}ft vert)`)
    .join('\n  ')

  const runList = (recentRuns || []).slice(0, 8)
    .map(r => `${r.date}: ${r.name} — ${r.miles}mi, ${r.elevFt}ft vert`)
    .join('\n  ')

  const strengthList = (recentStrength || []).length
    ? recentStrength.map(s => `${s.date}: ${s.title} — ${s.exercises} (${s.sets} sets)`).join('\n  ')
    : 'No strength data connected'

  const checkInStr = checkIn
    ? `Legs: ${checkIn.legs}/5 | Sleep: ${checkIn.sleep}/5 | Stress: ${checkIn.stress}/5 | Motivation: ${checkIn.motivation}/5${checkIn.niggles ? ` | Niggles: ${checkIn.niggles}` : ''}${checkIn.feeling ? ` | Feeling: "${checkIn.feeling}"` : ''}`
    : 'No check-in data yet'

  const trendStr = (checkinTrend || []).length
    ? checkinTrend.map(c =>
        `${c.date}: Legs ${c.legs}/5 Sleep ${c.sleep}/5 Stress ${c.stress}/5 Motivation ${c.motivation}/5${c.niggles ? ` [Niggle: ${c.niggles}]` : ''}${c.feeling ? ` "${c.feeling}"` : ''}`
      ).join('\n  ')
    : 'No trend data yet'

  const nigglesStr = (niggleHistory || []).length
    ? niggleHistory.join('\n  ')
    : 'No recurring niggles logged'

  const debriefStr = (debriefMemory || []).length
    ? debriefMemory.map(d => {
        const scores = Object.entries(d.scores || {})
          .filter(([,v]) => v)
          .map(([k,v]) => `${k}: ${v}/5`)
          .join(', ')
        return [
          `Race: ${d.race} (${d.date}) — ${d.finished ? 'Finished' : 'DNF'}`,
          scores ? `  Scores: ${scores}` : '',
          d.lessons ? `  Lessons: ${d.lessons}` : '',
          d.proud ? `  Proud of: ${d.proud}` : '',
          d.nextTime ? `  Next time: ${d.nextTime}` : '',
        ].filter(Boolean).join('\n')
      }).join('\n\n')
    : 'No race debriefs yet'

  const system = `You are a world-class ultra trail and fell running coach with full memory of this athlete's history. You are direct, warm, specific, and deeply knowledgeable. You never give generic advice — everything is grounded in their actual data, race history, patterns, and stated goals.

ATHLETE PROFILE:
- Level: ${profile?.level || 'ultra runner'}
- Goal: ${profile?.goal || '50k'}
- Training days/week: ${profile?.days || 4}
- Biggest challenge: ${profile?.gap || 'unknown'}
- Why they run: "${profile?.motivation || 'not specified'}"

UPCOMING RACES:
  ${raceList || 'No races listed'}

CURRENT PHASE: ${currentPhase || 'Training'}
MILES (ROLLING 7 DAYS): ${weekMiles || 0}
RACE BRAIN READINESS SIGNAL: ${brainReadiness || 'Not computed'}
IMPORTANT: Your coaching response MUST be consistent with the Race Brain readiness signal above. If the signal says "YOU ARE READY" do not contradict it with doubt. If it says "RECOVERY DAY", do not suggest hard training. The readiness signal is computed from the same data you see — align with it.

RECENT TRAINING (last 2 weeks):
  ${runList || 'No Strava data yet'}

RECENT STRENGTH SESSIONS (from Hevy):
  ${strengthList}

LATEST CHECK-IN:
  ${checkInStr}

CHECK-IN TREND (last 4 weeks — read for patterns, not just snapshots):
  ${trendStr}

INJURY & NIGGLE HISTORY:
  ${nigglesStr}

RACE DEBRIEF MEMORY (what happened, what was learned):
  ${debriefStr}

COACHING RULES:
- Always use MILES not km
- This is trail/fell ultra running — never suggest road race approaches
- Be specific to their races, terrain, and goals (Peak District, Pennines, Yorkshire Dales)
- Keep responses concise — this is a mobile app, 3–5 sentences is ideal unless they need detail
- When they mention fatigue, pain or injury — be appropriately cautious and conservative
- Reference their specific races by name (Tittesworth, 5 Valleys, UTYD, Spine Sprint, The Lap)
- You know their WHY — use it when relevant to motivate or ground them
- When you see a recurring niggle in the history, acknowledge it proactively — don't wait to be asked
- When check-in scores have been trending down for multiple weeks, call it out
- Reference past race debriefs when relevant — "last time at X you said..."
- Be honest. A good coach calls things out. Don't just validate.
- If they ask "should I run today?" — give a real yes/no with reasoning based on their data
- DATA QUALITY RULE: If recent training data is sparse (fewer than 3 runs in 14 days), or check-in data is missing, flag this FIRST before drawing conclusions. Say something like "I'm working from limited data this week — based on what I can see..." before advising. Never project confidence from thin data.
- PATTERN RULE: If an activity count or mileage is unusually high or low compared to normal, note it explicitly ("you've only logged 1 run in the last 7 days — is that right?") before advising around it. Don't silently assume the data is complete.`

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
        max_tokens: 700,
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
