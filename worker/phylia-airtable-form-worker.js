// Cloudflare Worker for the Phylia Consulting questionnaire.
// Deploy separately and set these Worker secrets:
// AIRTABLE_API_KEY = Airtable PAT with data.records:write for the Phylia2You Contacts base
// AIRTABLE_BASE_ID = appeAO1DmgjwwZ5ZQ
// AIRTABLE_TABLE_NAME = Inquiries
// ALLOWED_ORIGINS = comma-separated allowed website origins, e.g.
// https://phyliaconsulting.ca,https://www.phyliaconsulting.ca,https://phylia2you.github.io

const fields = {
  businessName: 'Business Name',
  contactName: 'Contact Name',
  email: 'Email',
  phone: 'Phone',
  businessType: 'Business Type',
  website: 'Website',
  location: 'Location',
  mainProblem: 'Main Problem',
  contactChannels: 'Customer Contact Channels',
  commonQuestions: 'Common Customer Questions',
  repeatedReplies: 'Repeated Replies',
  followUpProcess: 'Current Follow-Up Process',
  toolsUsed: 'Tools Used',
  preferredTone: 'Preferred Tone',
  sensitiveTopics: 'Sensitive Topics / Boundaries',
  caseStudyPermission: 'Permission for Anonymous Case Study',
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = (env.ALLOWED_ORIGINS || 'https://phyliaconsulting.ca,https://www.phyliaconsulting.ca,https://phylia2you.github.io')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    const cors = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    if (origin && !allowedOrigins.includes(origin)) return new Response('Origin not allowed', { status: 403, headers: cors });

    const input = await request.json();
    const airtableFields = {
      'Inquiry Source': 'Website',
      'Status': 'New',
      'Priority': 'Medium',
      'Date Received': new Date().toISOString().slice(0, 10),
    };
    for (const [key, airtableName] of Object.entries(fields)) {
      if (input[key]) airtableFields[airtableName] = String(input[key]).slice(0, 10000);
    }

    const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME || 'Inquiries')}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: airtableFields, typecast: true }),
    });
    if (!response.ok) return new Response(await response.text(), { status: 502, headers: cors });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }
};
