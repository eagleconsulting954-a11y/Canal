const { send, methodGuard, parseBody } = require('../_lib/http');
const { getSuite, findWaterway } = require('../_lib/store');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET', 'POST', 'PATCH'])) return;
  const suite = getSuite();
  if (req.method === 'GET') {
    return send(res, 200, { alerts: suite.alerts.map(alert => ({ ...alert, waterwayDetail: findWaterway(alert.waterway) })) });
  }
  const body = parseBody(req);
  if (req.method === 'PATCH') {
    return send(res, 200, { alertId: body.alertId || body.id, status: body.status || 'acknowledged', message: 'Demo alert state updated. Persistence requires a production database.' });
  }
  return send(res, 201, {
    alert: {
      id: `alert_${Date.now()}`,
      severity: body.severity || 'medium',
      authority: body.authority || 'CanalClear Demo Engine',
      waterway: body.waterway || 'panama',
      title: body.title || 'Demo authority update',
      message: body.message || 'A mock authority update was generated for demo testing.'
    }
  });
};
