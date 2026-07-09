const { send, methodGuard, parseBody } = require('../_lib/http');
const { listConnectors, testConnector, runConnectorSuite } = require('../_lib/connectors');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET', 'POST'])) return;
  if (req.method === 'GET') {
    return send(res, 200, { connectors: listConnectors() });
  }
  const body = parseBody(req);
  if (body.action === 'test-all') return send(res, 200, { results: runConnectorSuite() });
  return send(res, 200, { result: testConnector(body.connectorId || body.id || 'authority-rules') });
};
