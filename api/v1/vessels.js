const { send, methodGuard, parseBody } = require('../_lib/http');
const { getSuite, findVessel, findWaterway } = require('../_lib/store');
const { buildValidationReport } = require('../_lib/validator');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET', 'POST'])) return;
  const suite = getSuite();
  if (req.method === 'GET') {
    const id = req.query.id;
    if (id) {
      const vessel = findVessel(id);
      if (!vessel) return send(res, 404, { error: 'Vessel not found' });
      return send(res, 200, { vessel, waterway: findWaterway(vessel.waterway) });
    }
    return send(res, 200, { vessels: suite.vessels.map(vessel => ({ ...vessel, waterwayDetail: findWaterway(vessel.waterway) })) });
  }
  const body = parseBody(req);
  const vessel = body.vessel || body;
  const validation = buildValidationReport({ waterway: vessel.waterway, vessel, docs: vessel.docs || [] });
  return send(res, 201, { vessel: { ...vessel, id: vessel.id || `vessel_${Date.now()}` }, validation, note: 'Demo backend returns a created vessel response without persistent storage.' });
};
