const { getSuite } = require('./store');

function listConnectors() {
  return getSuite().connectors.map(connector => ({
    ...connector,
    lastSyncAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 45)).toISOString(),
    latencyMs: 80 + Math.floor(Math.random() * 260),
    recordsAvailable: 20 + Math.floor(Math.random() * 800)
  }));
}

function testConnector(id) {
  const connector = listConnectors().find(item => item.id === id) || listConnectors()[0];
  return {
    connectorId: connector.id,
    name: connector.name,
    status: 'healthy',
    demoMode: true,
    latencyMs: connector.latencyMs,
    checkedAt: new Date().toISOString(),
    samplePayload: {
      type: connector.type,
      message: `${connector.name} returned a healthy mock response.`,
      recordsAvailable: connector.recordsAvailable
    }
  };
}

function runConnectorSuite() {
  return listConnectors().map(connector => testConnector(connector.id));
}

module.exports = { listConnectors, testConnector, runConnectorSuite };
