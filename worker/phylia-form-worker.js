// Public website intake gateway for Phylia CRM.
//
// The browser never receives the private CRM intake token. This Worker checks
// the website origin, accepts only known questionnaire fields, and forwards
// the normalized JSON to the dashboard's token-protected PostgreSQL endpoint.
// Deploy with the Worker secret PHYLIA_PUBLIC_INTAKE_TOKEN configured.

const fieldNames = [
  'businessName',
  'contactName',
  'email',
  'phone',
  'businessType',
  'website',
  'location',
  'mainProblem',
  'contactChannels',
  'commonQuestions',
  'repeatedReplies',
  'followUpProcess',
  'toolsUsed',
  'preferredTone',
  'sensitiveTopics',
  'caseStudyPermission',
];

function corsHeaders(origin, allowedOrigins) {
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(payload, status, cors) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = (
      env.ALLOWED_ORIGINS
      || 'https://phyliaconsulting.ca,https://www.phyliaconsulting.ca,https://phylia2you.github.io'
    )
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const cors = corsHeaders(origin, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, cors);
    }
    if (origin && !allowedOrigins.includes(origin)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, cors);
    }
    if (!env.PHYLIA_PUBLIC_INTAKE_TOKEN) {
      return jsonResponse({ error: 'Intake service is not configured' }, 503, cors);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 50000) {
      return jsonResponse({ error: 'Request is too large' }, 413, cors);
    }

    let input;
    try {
      input = await request.json();
    } catch (_error) {
      return jsonResponse({ error: 'Invalid JSON' }, 400, cors);
    }

    const payload = {};
    for (const name of fieldNames) {
      if (input[name] !== undefined && input[name] !== null) {
        payload[name] = String(input[name]).trim().slice(0, 10000);
      }
    }

    for (const required of ['contactName', 'email', 'mainProblem']) {
      if (!payload[required]) {
        return jsonResponse({ error: `${required} is required` }, 400, cors);
      }
    }
    if (!payload.email.includes('@')) {
      return jsonResponse({ error: 'A valid email is required' }, 400, cors);
    }

    const endpoint = env.CRM_INTAKE_URL
      || 'https://dashboard.phyliaconsulting.ca/api/public/inquiry';
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Phylia-Intake-Token': env.PHYLIA_PUBLIC_INTAKE_TOKEN,
        },
        body: JSON.stringify(payload),
      });
    } catch (_error) {
      return jsonResponse({ error: 'CRM intake is temporarily unavailable' }, 502, cors);
    }

    if (!response.ok) {
      return jsonResponse({ error: 'CRM intake rejected the request' }, 502, cors);
    }

    return jsonResponse({ ok: true }, 200, cors);
  },
};
