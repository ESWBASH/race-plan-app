export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  // Accept key from env (preferred) or from request body (fallback for personal use)
  const apiKey = process.env.HEVY_API_KEY || body.apiKey
  if (!apiKey) return res.status(400).json({ error: 'No Hevy API key' })

  const { page = 1, pageSize = 10 } = body

  try {
    const r = await fetch(
      `https://api.hevyapp.com/v1/workouts?page=${page}&pageSize=${pageSize}`,
      { headers: { 'api-key': apiKey, 'Accept': 'application/json' } }
    )

    if (!r.ok) {
      const txt = await r.text()
      console.error('[hevy-data] API error:', r.status, txt)
      return res.status(r.status).json({ error: `Hevy API error: ${r.status}` })
    }

    const data = await r.json()

    // Normalise workouts for the frontend
    const workouts = (data.workouts || []).map(w => {
      const startMs = new Date(w.start_time).getTime()
      const endMs = w.end_time ? new Date(w.end_time).getTime() : null
      const durationMins = endMs ? Math.round((endMs - startMs) / 60000) : null

      const exercises = (w.exercises || []).map(ex => ({
        name: ex.title,
        sets: (ex.sets || []).map(s => ({
          type: s.set_type,
          reps: s.reps,
          weightKg: s.weight_kg,
          rpe: s.rpe,
        })).filter(s => s.reps || s.weightKg),
      })).filter(ex => ex.sets.length > 0)

      const totalSets = exercises.reduce((n, ex) => n + ex.sets.length, 0)
      const totalReps = exercises.reduce((n, ex) =>
        n + ex.sets.reduce((m, s) => m + (s.reps || 0), 0), 0)

      return {
        id: w.id,
        title: w.title || 'Strength Session',
        date: w.start_time ? w.start_time.slice(0, 10) : null,
        durationMins,
        exercises,
        totalSets,
        totalReps,
      }
    })

    res.status(200).json({
      workouts,
      page: data.page,
      pageCount: data.page_count,
    })
  } catch (err) {
    console.error('[hevy-data] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
