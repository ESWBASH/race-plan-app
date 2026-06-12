import { readFileSync } from 'fs'
import { join } from 'path'

let _hiveData = null
function getHiveData() {
  if (_hiveData) return _hiveData
  const p = join(process.cwd(), 'api', 'hive-data.json')
  _hiveData = JSON.parse(readFileSync(p, 'utf-8'))
  return _hiveData
}

// Simple keyword search — score messages by how many query words they contain
function search(messages, query, limit = 25) {
  const words = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['what','does','have','with','that','this','from','they','when','about','would','should','could','there','their','been','will','more','than','into','over','just'].includes(w))

  if (!words.length) return messages.slice(0, limit)

  const scored = messages.map(m => {
    const text = m.t.toLowerCase()
    let score = 0
    for (const w of words) {
      if (text.includes(w)) score += text.split(w).length - 1
    }
    return { ...m, score }
  }).filter(m => m.score > 0)

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  const { query, race } = body
  if (!query) return res.status(400).json({ error: 'No query' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  let messages
  try {
    messages = getHiveData()
  } catch (err) {
    return res.status(500).json({ error: 'Could not load hive data: ' + err.message })
  }

  // Search for relevant messages
  const relevant = search(messages, query)

  if (!relevant.length) {
    return res.status(200).json({
      answer: "The hive hasn't specifically discussed that yet — but keep asking, the community is always sharing new insights.",
      sourceCount: 0
    })
  }

  // Format for Claude
  const communitySnippets = relevant.map(m =>
    `[${m.c}] ${m.s}: "${m.t}"`
  ).join('\n\n')

  const raceContext = race
    ? `The runner is preparing for: ${race.name} (${race.distanceMi}mi, ${race.elevationFt}ft vert, ${race.location}, ${race.date})`
    : 'General ultra running query'

  const system = `You are synthesising community knowledge from a real women's ultra running WhatsApp support group focused on the Spine Race and fell/trail ultras. Your job is to extract and present the most useful insights from real conversations between experienced runners.

${raceContext}

COMMUNITY MESSAGES (selected as most relevant to the query):
${communitySnippets}

SYNTHESIS RULES:
- Speak as "the community" or "your hive" — attribute insights to the group, not to individuals
- Be specific and actionable — pull out the concrete tips, not vague encouragement
- Use the actual language and terminology the community uses
- If there is genuine consensus, say so. If there are different views, show both
- Keep it to 3–5 key insights maximum — dense, useful, not padded
- Tone: warm, real, experienced runner to experienced runner
- End with a short "Hive consensus:" one-liner if a clear view emerges
- NEVER make up advice that isn't grounded in the messages you've been given
- Use miles not km
- This is trail/fell ultra context only`

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
        max_tokens: 500,
        system,
        messages: [{ role: 'user', content: query }],
      }),
    })

    const data = await response.json()
    if (!data.content?.[0]?.text) {
      console.error('[hive-intel] API error:', JSON.stringify(data))
      return res.status(500).json({ error: 'No response from AI' })
    }

    res.status(200).json({
      answer: data.content[0].text,
      sourceCount: relevant.length,
      sources: relevant.slice(0, 5).map(m => ({ chat: m.c, snippet: m.t.slice(0, 80) }))
    })
  } catch (err) {
    console.error('[hive-intel] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
