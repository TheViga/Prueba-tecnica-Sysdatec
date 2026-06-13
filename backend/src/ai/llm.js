import OpenAI from 'openai';

// The classifier talks to an OpenAI-compatible LLM endpoint, so the OpenAI SDK
// is pointed at the provider's base URL (Cerebras by default). Switching
// provider/model is just a matter of changing LLM_BASE_URL / LLM_MODEL.

const PLACEHOLDER_KEY = 'your_api_key_here';

const apiKey = process.env.LLM_API_KEY;
const baseURL = process.env.LLM_BASE_URL || 'https://api.cerebras.ai/v1';
const model = process.env.LLM_MODEL || 'gpt-oss-120b';

export const CATEGORIES = ['Finance', 'Legal', 'Procurement', 'Operations'];
export const PRIORITIES = ['High', 'Medium', 'Low'];

// True only when a real API key is present (ignores the .env.example placeholder).
export const isAiConfigured = () =>
  Boolean(apiKey) && apiKey !== PLACEHOLDER_KEY;

let client = null;
function getClient() {
  if (!client) {
    // maxRetries lets the SDK ride out transient 429s (busy free tiers).
    client = new OpenAI({ apiKey, baseURL, timeout: 30000, maxRetries: 3 });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an operations assistant that triages incoming support tickets.
Classify each ticket and reply with a single JSON object, nothing else.

Schema:
{
  "category": one of ${JSON.stringify(CATEGORIES)},
  "priority": one of ${JSON.stringify(PRIORITIES)},
  "summary": a concise one-sentence summary of the request (max ~160 chars)
}

Pick the closest category. Use priority "High" for urgent, blocking or
financially/legally sensitive issues, "Low" for routine requests, "Medium"
otherwise.

Write the "summary" in the same language as the request text (e.g. a Spanish
request gets a Spanish summary). The "category" and "priority" values must
always stay exactly as written in the schema, in English.`;

// Best-effort extraction of a JSON object from a model response.
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Model did not return valid JSON');
  }
}

// Coerce model output into the allowed values so the DB never holds garbage.
function normalize(data) {
  const category = CATEGORIES.includes(data?.category)
    ? data.category
    : 'Operations';
  const priority = PRIORITIES.includes(data?.priority)
    ? data.priority
    : 'Medium';
  const summary =
    typeof data?.summary === 'string' && data.summary.trim()
      ? data.summary.trim().slice(0, 280)
      : 'No summary available.';
  return { category, priority, summary };
}

// Ask the LLM to classify a ticket. Returns { category, priority, summary }.
export async function classifyTicket({ customerName, requestText, attachmentUrl }) {
  const userContent = [
    `Customer: ${customerName}`,
    `Request: ${requestText}`,
    `Attachment: ${attachmentUrl || 'none'}`,
  ].join('\n');

  const completion = await getClient().chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  return normalize(parseJson(raw));
}
