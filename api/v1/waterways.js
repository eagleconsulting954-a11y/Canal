const { send, methodGuard } = require('../_lib/http');
const { getSuite, findWaterway } = require('../_lib/store');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET'])) return;
  const suite = getSuite();
  const id = req.query.id;
  if (id) return send(res, 200, { waterway: findWaterway(id) });
  return send(res, 200, { waterways: suite.waterways });
};
