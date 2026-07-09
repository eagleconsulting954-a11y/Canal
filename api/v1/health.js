const { send, methodGuard } = require('../_lib/http');
const { getSuite } = require('../_lib/store');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET'])) return;
  const suite = getSuite();
  return send(res, 200, {
    service: 'CanalClear Demo Backend',
    version: '1.0.0',
    demoMode: true,
    status: 'healthy',
    counts: {
      connectors: suite.connectors.length,
      waterways: suite.waterways.length,
      vessels: suite.vessels.length,
      routeOptions: suite.routeOptions.length
    },
    timestamp: new Date().toISOString()
  });
};
