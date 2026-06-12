// Creates a workout in Hevy from a structured list of exercises
// Flow: search exercise templates by name → build payload → POST /v1/workouts
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const apiKey = process.env.HEVY_API_KEY || body.apiKey
  if (!apiKey) return res.status(400).json({ error: 'No Hevy API key' })

  const { title, exercises } = body
  // exercises: [{ name, sets, reps, notes }]
  if (!exercises?.length) return res.status(400).json({ error: 'No exercises' })

  const headers = { 'api-key': apiKey, 'Accept': 'application/json', 'Content-Type': 'application/json' }

  // Search for each exercise template
  const resolvedExercises = []
  for (const ex of exercises) {
    try {
      const searchRes = await fetch(
        `https://api.hevyapp.com/v1/exercise_templates?query=${encodeURIComponent(ex.name)}&page=1&pageSize=5`,
        { headers }
      )
      if (searchRes.ok) {
        const data = await searchRes.json()
        const templates = data.exercise_templates || []
        // Pick best match: exact name first, then first result
        const exact = templates.find(t => t.title?.toLowerCase() === ex.name.toLowerCase())
        const template = exact || templates[0]
        if (template) {
          resolvedExercises.push({
            exercise_template_id: template.id,
            superset_id: null,
            rest_seconds: 90,
            notes: ex.notes || '',
            sets: Array.from({ length: ex.sets || 3 }, () => ({
              type: 'normal',
              weight_kg: null,
              reps: ex.reps || 8,
              rpe: null,
            })),
          })
        } else {
          // No template found — skip but log
          console.warn('[hevy-create] no template for:', ex.name)
        }
      }
    } catch (err) {
      console.warn('[hevy-create] template search error for', ex.name, err.message)
    }
  }

  if (!resolvedExercises.length) {
    return res.status(422).json({ error: 'Could not resolve any exercise templates', exercises })
  }

  // Create the workout
  const now = new Date().toISOString()
  const payload = {
    workout: {
      title: title || 'Coach S&C Session',
      description: 'Suggested by ClaudeCoach',
      start_time: now,
      end_time: null,
      is_private: false,
      exercises: resolvedExercises,
    },
  }

  try {
    const createRes = await fetch('https://api.hevyapp.com/v1/workouts', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    const data = await createRes.json()
    if (!createRes.ok) {
      console.error('[hevy-create] create error:', createRes.status, JSON.stringify(data))
      return res.status(createRes.status).json({ error: data.error || 'Hevy API error', detail: data })
    }
    res.status(200).json({ workoutId: data.workout?.id, exercisesResolved: resolvedExercises.length, total: exercises.length })
  } catch (err) {
    console.error('[hevy-create] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
