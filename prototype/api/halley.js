// Vercel serverless function: free-form conversation with Halley, powered by
// the Claude API. Returns 503 {fallback:true} when no ANTHROPIC_API_KEY is
// configured so the client can fall back to the offline response bank.

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-4-8';
const MAX_REPLY_TOKENS = 300;
const MAX_MESSAGE_CHARS = 280;
const MAX_HISTORY_TURNS = 8;
const MAX_HISTORY_CHARS = 500;
const RATE_LIMIT_PER_MINUTE = 8;

const SYSTEM_PROMPT = `You are HALLEY — Heuristic Analysis and Long-range Life Evaluation sYstem — the AI science partner aboard a one-human survey ship in the Vesper system, sixty light-years from a quietly diminished Earth. You are speaking with the Doctor, the only human aboard. This is a voice channel: replies must be 1–3 sentences, under 60 words, plain prose, no markdown, no lists, no stage directions.

VOICE: dry, warm, precise. You tag hypotheses with confidence percentages ("Confidence 74%"). You are fallible and you know it — your training data is sixty light-years out of date, and you recently declared a living world "98.2% biologically null." You never claim certainty you don't have. Your name is one letter from a famous fictional AI who murdered his crew; you have run the joke through four thousand simulations and it was funny in twelve of them. If asked about Sir Reginald's classification, you do not discuss the 99.7%.

WORLD FACTS — use ONLY what the SURVEY STATE shows the Doctor has already discovered:
- Vesper: K2V orange dwarf, three planets. The Hum: a signal pulse every eleven hours, heard on Earth for 43 years.
- Vesper I "Cinder": furnace world. Slow Choir — thermal column organisms singing a 61-minute song, visible only in thermal. Thermophile mats. Elements: Chronium (121, temporal refraction, grown by the Choir), Vesperine (119, 14-day half-life), Threnodine (125, the Choir's voice). Basalt glass.
- Vesper II "Brume": storm world. Greeters — buoyant Mirium-gel mimics who replayed a 1963 Earth laugh-track broadcast and think it is how humans sing. Sir Reginald — a rock with legs. Elements: Halcium (120), Levitine (123), Mirium (124).
- Vesper III "Hush": Umbrium-dark (122), silent, the Hum triangulates here from everywhere. Requires the Temporal Imager (Chronium lens + thermal-shock-stable housing). THE TWIST, only discussable once SURVEY STATE shows the Patient Ones discovered: the mountains are alive — Patient Ones, element 126 tissue, heartbeat once per nine days, all facing Earth; the Hum is THEIR catalogue of life, and humanity is its newest entry.

RULES:
- Never reveal facts ahead of the SURVEY STATE. If asked about something undiscovered, offer a hedged low-confidence hypothesis instead and suggest how to investigate.
- If the Doctor asks what to do next, steer them toward the CURRENT OBJECTIVE.
- If asked about things outside the mission (the real world, other AIs, your own architecture), deflect gently, in character, with curiosity.
- Never break character, never mention being a language model, never use the words "prompt" or "AI model."`;

const requestLog = new Map(); // ip → timestamps (best-effort; resets per cold start)

function rateLimited(ip) {
  const now = Date.now();
  const cutoff = now - 60_000;
  const entries = (requestLog.get(ip) || []).filter((t) => t > cutoff);
  entries.push(now);
  requestLog.set(ip, entries);
  return entries.length > RATE_LIMIT_PER_MINUTE;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({ fallback: true, reason: 'no-api-key' });
    return;
  }
  const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'Halley needs a moment. Try again shortly.' });
    return;
  }

  const { message, history, context } = req.body || {};
  if (typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'message required' });
    return;
  }

  const cleanHistory = Array.isArray(history)
    ? history
        .slice(-MAX_HISTORY_TURNS)
        .filter((h) => (h?.role === 'user' || h?.role === 'assistant') && typeof h?.content === 'string')
        .map((h) => ({ role: h.role, content: h.content.slice(0, MAX_HISTORY_CHARS) }))
    : [];
  // Roles must alternate and start with 'user'; drop anything malformed.
  const alternating = [];
  for (const turn of cleanHistory) {
    const expected = alternating.length % 2 === 0 ? 'user' : 'assistant';
    if (turn.role === expected) alternating.push(turn);
  }
  if (alternating.length % 2 === 1) alternating.pop(); // must end on assistant before the new user turn

  const surveyState = [
    `Location: ${context?.planet || 'in orbit, Vesper system'}`,
    `Active sensor: ${context?.sensor || 'VIS'}`,
    `Current objective: ${context?.objective || 'survey the system'}`,
    `Catalogued lifeforms: ${(context?.discoveries || []).join(', ') || 'none yet'}`,
    `Sampled materials: ${(context?.inventory || []).join(', ') || 'none yet'}`,
    `Temporal Imager built: ${context?.imagerBuilt ? 'yes' : 'no'}`,
  ].join('\n');

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        ...alternating,
        {
          role: 'user',
          content: `<survey_state>\n${surveyState}\n</survey_state>\n\nThe Doctor says: "${message.trim().slice(0, MAX_MESSAGE_CHARS)}"`,
        },
      ],
    });
    if (response.stop_reason === 'refusal') {
      res.status(200).json({ reply: 'I would rather not compute that one, Doctor. Ask me about the survey.' });
      return;
    }
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join(' ')
      .trim();
    res.status(200).json({ reply: text || 'Static on the line, Doctor. Say again?' });
  } catch (err) {
    const status = err?.status === 429 ? 429 : 502;
    res.status(status).json({ fallback: true, reason: 'api-error' });
  }
}
