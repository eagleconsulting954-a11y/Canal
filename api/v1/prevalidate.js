const { send, methodGuard, parseBody } = require('../_lib/http');
const { buildValidationReport } = require('../_lib/validator');
const { getSuite } = require('../_lib/store');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET', 'POST'])) return;
  if (req.method === 'GET') {
    return send(res, 200, {
      message: 'POST a vessel, waterway, and document packet to run the CanalClear v1 pre-validator.',
      supportedWaterways: getSuite().waterways.map(w => ({ id: w.id, name: w.name, authority: w.authority, limits: w.limits, requiredDocs: w.requiredDocs }))
    });
  }
  const payload = parseBody(req);
  return send(res, 200, { validation: buildValidationReport(payload) });
};
