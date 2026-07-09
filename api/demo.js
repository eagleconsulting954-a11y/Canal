const data = require('./_demoData');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const resource = req.query.resource || 'suite';
  const payload = {
    suite: {
      demoMode: true,
      message: 'CanalClear full-suite mock backend. Data is safe demo data for testing UI workflows.',
      connectors: data.connectors,
      waterways: Object.values(data.waterwayRules),
      vessels: data.vessels,
      alerts: data.alerts,
      routeOptions: data.routeOptions
    },
    connectors: data.connectors,
    waterways: Object.values(data.waterwayRules),
    waterwayRules: data.waterwayRules,
    vessels: data.vessels,
    alerts: data.alerts,
    routeOptions: data.routeOptions
  }[resource];

  if (!payload) return res.status(404).json({ error: 'Unknown demo resource', available: ['suite','connectors','waterways','waterwayRules','vessels','alerts','routeOptions'] });
  return res.status(200).json(payload);
};
