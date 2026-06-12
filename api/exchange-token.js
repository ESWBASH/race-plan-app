export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const code = req.query?.code

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!code) return res.status(400).json({ error: 'Missing code' })
  if (!clientId) return res.status(500).json({ error: 'STRAVA_CLIENT_ID env var not set' })
  if (!clientSecret) return res.status(500).json({ error: 'STRAVA_CLIENT_SECRET env var not set' })

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })
    const data = await response.json()
    if (!data.access_token) {
      // Return Strava's full error so we can diagnose
      const stravaErrors = data.errors?.map(e => `${e.resource} ${e.field}: ${e.code}`).join(', ')
      return res.status(400).json({
        error: `${data.message}${stravaErrors ? ` — ${stravaErrors}` : ''}`,
      })
    }
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
