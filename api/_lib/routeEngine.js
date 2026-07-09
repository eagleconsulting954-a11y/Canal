const { getSuite, findWaterway } = require('./store');

function compareRoutes(payload = {}) {
  const suite = getSuite();
  const fuelPerDay = Number(payload.fuelPerDay || payload.fuel || 52000);
  const delaySensitivity = Number(payload.delaySensitivity || payload.delay || 1);
  const profile = payload.profile || 'container';
  const allowed = {
    container: ['container', 'panama-container', 'suez-container', 'cape-container'],
    bulk: ['bulk', 'stlawrence-bulk'],
    feeder: ['feeder', 'kiel-feeder'],
    tanker: ['tanker']
  }[profile] || [profile];
  const options = suite.routeOptions
    .filter(route => route.profile === profile || allowed.includes(route.profile) || allowed.includes(route.id))
    .map(route => {
      const waterway = findWaterway(route.waterway);
      const fuelCost = route.days * fuelPerDay;
      const delayCost = route.days * fuelPerDay * route.delayRisk * delaySensitivity;
      const total = route.toll + fuelCost + delayCost;
      return {
        ...route,
        waterwayName: waterway.name,
        authority: waterway.authority,
        fuelCost,
        delayCost: Math.round(delayCost),
        total: Math.round(total),
        confidence: Math.max(70, Math.round(96 - route.delayRisk * 100 * delaySensitivity))
      };
    })
    .sort((a, b) => a.total - b.total);
  return {
    comparisonId: `route_${Date.now()}`,
    demoMode: true,
    profile,
    fuelPerDay,
    delaySensitivity,
    recommended: options[0] || null,
    options,
    assumptions: ['Mock toll data', 'Synthetic delay risk', 'Fuel/day multiplier', 'No live authority rates'],
    nextActions: ['Confirm licensed toll source before production use.', 'Attach route decision brief to vessel record.']
  };
}

module.exports = { compareRoutes };
