const { send, methodGuard, parseBody } = require('../_lib/http');
const { compareRoutes } = require('../_lib/routeEngine');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET', 'POST'])) return;
  const payload = req.method === 'GET' ? req.query : parseBody(req);
  return send(res, 200, { comparison: compareRoutes(payload) });
};
