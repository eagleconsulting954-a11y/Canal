const { validateTransit, waterwayRules } = require('./_demoData');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      demoMode: true,
      message: 'POST a vessel payload to validate against CanalClear demo waterway rules.',
      supportedWaterways: Object.values(waterwayRules).map(w => ({ id: w.id, name: w.name, authority: w.authority, limits: w.limits, requiredDocs: w.requiredDocs }))
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST for pre-validation.' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    return res.status(200).json(validateTransit(payload));
  } catch (error) {
    return res.status(400).json({ error: 'Invalid validation payload', details: error.message });
  }
};
