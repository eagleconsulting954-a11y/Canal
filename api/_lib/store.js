const seed = require('../_demoData');

const demoUsers = [
  { id: 'user-owner', name: 'Owner Demo', role: 'Owner', orgId: 'org-blue-harbor' },
  { id: 'user-agent', name: 'Agent Demo', role: 'Agent', orgId: 'org-blue-harbor' },
  { id: 'user-analyst', name: 'Compliance Analyst Demo', role: 'Compliance Analyst', orgId: 'org-canalclear' },
  { id: 'user-admin', name: 'Admin Demo', role: 'Admin', orgId: 'org-canalclear' }
];

const demoRoles = [
  { role: 'Owner', permissions: ['fleet:read', 'filings:approve', 'alerts:read', 'reports:export'] },
  { role: 'Fleet Manager', permissions: ['fleet:write', 'vessels:write', 'routes:compare', 'documents:review'] },
  { role: 'Agent', permissions: ['filings:write', 'documents:upload', 'exceptions:resolve', 'submissions:create'] },
  { role: 'Compliance Analyst', permissions: ['rules:write', 'rules:approve', 'validations:audit', 'documents:review'] },
  { role: 'Admin', permissions: ['*'] }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSuite() {
  return {
    demoMode: true,
    version: 'backend-v1',
    connectors: clone(seed.connectors),
    waterways: Object.values(seed.waterwayRules).map(w => clone(w)),
    waterwayRules: clone(seed.waterwayRules),
    vessels: clone(seed.vessels),
    alerts: clone(seed.alerts),
    routeOptions: clone(seed.routeOptions),
    users: clone(demoUsers),
    roles: clone(demoRoles)
  };
}

function findWaterway(idOrName) {
  const key = String(idOrName || '').toLowerCase();
  return Object.values(seed.waterwayRules).find(w => w.id === key || w.name.toLowerCase() === key) || seed.waterwayRules.panama;
}

function findVessel(idOrName) {
  const key = String(idOrName || '').toLowerCase();
  return seed.vessels.find(v => v.id === key || v.name.toLowerCase() === key || v.imo.toLowerCase() === key) || null;
}

function getActor(req) {
  const requestedRole = req.headers['x-demo-role'] || 'Admin';
  const requestedOrg = req.headers['x-demo-org'] || 'org-canalclear';
  const role = demoRoles.find(r => r.role.toLowerCase() === String(requestedRole).toLowerCase()) || demoRoles.find(r => r.role === 'Admin');
  return { id: 'demo-session-user', role: role.role, orgId: requestedOrg, permissions: role.permissions };
}

module.exports = { getSuite, findWaterway, findVessel, getActor, demoRoles, demoUsers };
