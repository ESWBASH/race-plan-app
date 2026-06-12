export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const { activities } = body || {}
  if (!activities?.length) return res.status(400).json({ error: 'No activities' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  // Build activity list for classification
  // Include all signals the model can use
  const activityLines = activities.map((a, i) => {
    const miles = (a.distance * 0.000621371).toFixed(1)
    const elevFt = Math.round((a.total_elevation_gain || 0) * 3.28084)
    const mins = Math.round(a.moving_time / 60)
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    const duration = hrs > 0 ? `${hrs}h${remMins}m` : `${mins}m`
    const date = new Date(a.start_date_local)
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const day = dayNames[date.getDay()]
    const hour = date.getHours()
    const timeStr = `${hour}:${String(date.getMinutes()).padStart(2,'0')}`
    const pacePerMile = a.moving_time / (a.distance * 0.000621371)
    const paceMin = Math.floor(pacePerMile / 60)
    const paceSec = Math.round(pacePerMile % 60)
    const pace = `${paceMin}:${String(paceSec).padStart(2,'0')}/mi`
    const achievements = a.achievement_count || 0

    return `${i + 1}. id=${a.id} | "${a.name}" | ${miles}mi | ${elevFt}ft vert | ${duration} | ${pace} | ${day} ${timeStr} | ${date.toISOString().slice(0,10)} | achievements=${achievements}`
  }).join('\n')

  const system = `You are classifying Strava running activities as races or training runs for an ultra trail runner based in the UK.

Respond with ONLY a JSON array of objects. No prose. No markdown. Just raw JSON.

For each activity, decide: race or training.

Signals that strongly suggest RACE:
- Name contains: race, ultra, half, marathon, 50k, 10k, 5k, parkrun, fell, challenge, event name (e.g. "Liverpool", "SheUltra", "Endure"), "miles" as a number
- Distance matches standard race distances within 5%: 3.1mi (5k), 4.97mi (8k), 6.2mi (10k), 9.3mi (15k), 13.1mi (half), 26.2mi (marathon), 31.1mi (50k), 50mi, 62.1mi (100k), or any other suspiciously round distance for a trail ultra
- Saturday or Sunday morning start (6am–11am)
- Achievements > 3 (segment PRs happen in races)
- Very long duration for the distance suggesting event-style movement (e.g. 8h for 30mi = navigating/walking sections = likely ultra race)
- Dates that cluster with typical UK race season (Jan–Oct)

Signals that suggest TRAINING:
- Generic names: "Morning Run", "Evening Run", "Easy Run", "Trail Run", "Long Run", "Run", just a day name
- Weekday start
- Distance doesn't match standard race distances (e.g. 14mi, 17mi, 21mi)
- Low achievements

Return ONLY this JSON shape:
[
  {"id": 12345678, "verdict": "race", "confidence": 85, "reason": "half marathon distance, Saturday morning, name contains Liverpool"},
  {"id": 87654321, "verdict": "training", "confidence": 90, "reason": "generic name, Wednesday evening, 14mi = no standard race distance"}
]

Only include activities you classify as "race" with confidence >= 65. Leave out definite training runs.`

  const userMsg = `Classify these Strava activities:\n\n${activityLines}`

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
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text
    if (!text) {
      console.error('[classify-races] no response:', JSON.stringify(data))
      return res.status(500).json({ error: 'No response' })
    }

    // Parse JSON from response — strip any markdown fencing if present
    const clean = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    let results
    try {
      results = JSON.parse(clean)
    } catch {
      console.error('[classify-races] parse error, raw:', text)
      return res.status(500).json({ error: 'Parse error', raw: text })
    }

    res.status(200).json({ races: results })
  } catch (err) {
    console.error('[classify-races] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
