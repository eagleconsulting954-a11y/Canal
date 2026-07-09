function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Demo-Role, X-Demo-Org');
}

function send(res, statusCode, body) {
  setCors(res);
  return res.status(statusCode).json({
    ok: statusCode >= 200 && statusCode < 300,
    requestId: `cc_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    ...body
  });
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (error) { return {}; }
  }
  return req.body;
}

function methodGuard(req, res, allowed = ['GET']) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  if (!allowed.includes(req.method)) {
    send(res, 405, { error: `Method ${req.method} not allowed`, allowed });
    return true;
  }
  return false;
}

module.exports = { setCors, send, parseBody, methodGuard };
