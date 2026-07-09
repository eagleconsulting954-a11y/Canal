const state = {
  activeView: 'overview',
  currentWeek: 1,
  fleetFilter: 'all',
  selectedVesselId: 'atlantic-meridian',
  alerts: [
    {
      id: 'a1',
      severity: 'high',
      authority: 'Panama ACP',
      title: 'Draft limit review required',
      body: 'Northbound booking needs a fresh draft validation before pre-arrival filing closes.',
      time: '22 min ago',
      open: true
    },
    {
      id: 'a2',
      severity: 'medium',
      authority: 'Suez SCA',
      title: 'IMDG attachment mismatch',
      body: 'Hazmat manifest version does not match uploaded cargo declaration for vessel Ocean Kestrel.',
      time: '1 hr ago',
      open: true
    },
    {
      id: 'a3',
      severity: 'low',
      authority: 'Bosporus VTS',
      title: 'Pilot booking window opened',
      body: 'Transit advisory window opened. Agent owner handoff can now be initiated.',
      time: 'Today',
      open: true
    }
  ],
  vessels: [
    { id: 'atlantic-meridian', name: 'Atlantic Meridian', status: 'risk', waterway: 'Panama', eta: '18:45 UTC', owner: 'Blue Harbor Line', progress: [78, 91, 64], risk: 'Draft check due', docs: '7/9', handoff: 'Owner review' },
    { id: 'ocean-kestrel', name: 'Ocean Kestrel', status: 'filing', waterway: 'Suez', eta: '03:20 UTC', owner: 'Northstar Bulk', progress: [62, 73, 48], risk: 'IMDG mismatch', docs: '5/8', handoff: 'Agent active' },
    { id: 'pacific-lumen', name: 'Pacific Lumen', status: 'cleared', waterway: 'Malacca', eta: '11:10 UTC', owner: 'Aster Fleet', progress: [100, 96, 92], risk: 'No open risk', docs: '9/9', handoff: 'Complete' },
    { id: 'gulf-courier', name: 'Gulf Courier', status: 'filing', waterway: 'Bosporus', eta: '20:30 UTC', owner: 'Meridian Tankers', progress: [84, 82, 51], risk: 'Pilot window', docs: '6/7', handoff: 'Pending owner' },
    { id: 'nordic-valiant', name: 'Nordic Valiant', status: 'risk', waterway: 'Kiel', eta: '08:15 UTC', owner: 'Fjord Marine', progress: [55, 61, 30], risk: 'Air draft review', docs: '4/8', handoff: 'Unassigned' }
  ]
};

const thresholds = {
  panama: { name: 'Panama Canal', loa: 366, beam: 51.25, draft: 15.2, airDraft: 57.9 },
  suez: { name: 'Suez Canal', loa: 400, beam: 77.5, draft: 20.1, airDraft: 68 },
  bosporus: { name: 'Bosporus Strait', loa: 300, beam: 58, draft: 18, airDraft: 64 },
  kiel: { name: 'Kiel Canal', loa: 235, beam: 32.5, draft: 9.5, airDraft: 40 }
};

const pipeline = {
  1: {
    alerts: ['Discovery', 'Data/schema design', 'Rule-source catalog'],
    fleet: ['Discovery', 'Permission model', 'Fleet workflows'],
    routes: ['Discovery', 'Toll source validation', 'Licensing check']
  },
  2: {
    alerts: ['Data/schema design', 'Rules database', 'Historical versioning'],
    fleet: ['Data/schema design', 'Multi-tenant model', 'Agent-owner links'],
    routes: ['Data/schema design', 'Rate model', 'Versioning logic']
  },
  3: {
    alerts: ['Backend build', 'Eligibility API', 'Alert pipeline'],
    fleet: ['Backend build starts', 'RBAC', 'Fleet APIs'],
    routes: ['Backend build', 'Calculation engine', 'Route option model']
  },
  4: {
    alerts: ['Frontend build', 'Alert inbox', 'Checker embedded'],
    fleet: ['Backend build', 'Handoff state machine', 'Role permissions'],
    routes: ['Backend + frontend', 'Side-by-side cost view', 'Scenario inputs']
  },
  5: {
    alerts: ['Integration QA', 'False-positive tests', 'Design-partner pilot'],
    fleet: ['Frontend build', 'Dashboard cards', 'Status surfaces'],
    routes: ['Integration QA', 'Cost validation', 'Known-voyage checks']
  },
  6: {
    alerts: ['Launch', 'Alert-to-action metrics', 'Iteration loop'],
    fleet: ['Frontend build continues', 'Handoff screens', 'Load tests prep'],
    routes: ['Pilot', 'Operator feedback', 'Launch readiness']
  },
  7: {
    alerts: ['Monitor', 'False-alarm feedback', 'Rule tuning'],
    fleet: ['Frontend build continues', 'Large fleet views', 'UX polish'],
    routes: ['Launch', 'Decision influence tracking', 'Iteration loop']
  },
  8: {
    alerts: ['Iterate', 'Notification tuning', 'Rule library growth'],
    fleet: ['Frontend build continues', 'Edge-case workflows', 'Internal QA prep'],
    routes: ['Monitor', 'Rate updates', 'Adoption analytics']
  },
  9: {
    alerts: ['Stable operations', 'Compliance analyst upkeep', 'Customer feedback'],
    fleet: ['QA + pilot', 'Permission edge cases', '10–30 vessel pilots'],
    routes: ['Stable operations', 'Decision analytics', 'Data partner loop']
  },
  10: {
    alerts: ['Stable operations', 'Conversion reporting', 'Rule-source expansion'],
    fleet: ['Launch', 'Plan upgrade tracking', 'Sales handoff'],
    routes: ['Stable operations', 'Comparison analytics', 'Roadmap input']
  }
};

const routeBase = {
  container: [
    { name: 'Panama Canal', toll: 438000, days: 23, delay: 0.11, confidence: 94 },
    { name: 'Suez Canal', toll: 512000, days: 27, delay: 0.15, confidence: 89 },
    { name: 'Cape of Good Hope', toll: 0, days: 35, delay: 0.07, confidence: 82 }
  ],
  bulk: [
    { name: 'Suez Canal', toll: 331000, days: 24, delay: 0.12, confidence: 91 },
    { name: 'Cape of Good Hope', toll: 0, days: 33, delay: 0.08, confidence: 84 },
    { name: 'Panama Canal', toll: 286000, days: 31, delay: 0.14, confidence: 78 }
  ],
  tanker: [
    { name: 'Suez Canal', toll: 398000, days: 21, delay: 0.1, confidence: 92 },
    { name: 'Cape of Good Hope', toll: 0, days: 30, delay: 0.06, confidence: 87 },
    { name: 'Bosporus + Med', toll: 118000, days: 25, delay: 0.18, confidence: 79 }
  ]
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function setView(view) {
  state.activeView = view;
  qsa('.view').forEach(section => section.classList.toggle('is-visible', section.id === view));
  qsa('[data-nav]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.nav === view));
  document.body.classList.remove('nav-open');
  history.replaceState(null, '', `#${view}`);
  if (view === 'pipeline') renderPipeline();
}

function renderAlerts() {
  const list = qs('#alertList');
  const openCount = state.alerts.filter(alert => alert.open).length;
  qs('#alertBadge').textContent = `${openCount} open`;
  list.innerHTML = state.alerts.map(alert => `
    <article class='alert-item ${alert.open ? '' : 'is-closed'}' data-alert-id='${alert.id}'>
      <div class='alert-top'>
        <div>
          <h4>${alert.title}</h4>
          <p>${alert.authority} · ${alert.time}</p>
        </div>
        <span class='severity-${alert.severity}'>${alert.severity}</span>
      </div>
      <p>${alert.body}</p>
      <div class='alert-actions'>
        <button data-action='ackAlert' data-id='${alert.id}'>${alert.open ? 'Acknowledge' : 'Reopen'}</button>
        <button data-action='openFiling' data-id='${alert.id}'>Open filing</button>
      </div>
    </article>
  `).join('');
}

function simulateAlert() {
  const templates = [
    ['high', 'Panama ACP', 'Booking slot conflict detected', 'Transit slot changed. Two vessels now compete for the same filing window.'],
    ['medium', 'Suez SCA', 'Crew manifest validation warning', 'Crew document dates need review before SCA submission.'],
    ['low', 'Kiel Canal', 'Advisory notice refreshed', 'Pilotage advisory was updated and linked to the vessel record.'],
    ['medium', 'Bosporus VTS', 'Traffic suspension window', 'Northbound transit may require schedule adjustment due to a VTS window.']
  ];
  const pick = templates[Math.floor(Math.random() * templates.length)];
  state.alerts.unshift({
    id: `a${Date.now()}`,
    severity: pick[0],
    authority: pick[1],
    title: pick[2],
    body: pick[3],
    time: 'Just now',
    open: true
  });
  renderAlerts();
  toast('New authority alert generated and added to the inbox.');
}

function acknowledgeAlert(id) {
  const alert = state.alerts.find(item => item.id === id);
  if (!alert) return;
  alert.open = !alert.open;
  renderAlerts();
  toast(alert.open ? 'Alert reopened.' : 'Alert acknowledged and removed from open count.');
}

function ackAll() {
  state.alerts.forEach(alert => alert.open = false);
  renderAlerts();
  toast('All alerts acknowledged.');
}

function runEligibility(event) {
  event.preventDefault();
  const key = qs('#waterway').value;
  const limit = thresholds[key];
  const specs = {
    loa: Number(qs('#loa').value),
    beam: Number(qs('#beam').value),
    draft: Number(qs('#draft').value),
    airDraft: Number(qs('#airDraft').value)
  };
  const cargo = qs('#cargoClass').value;
  const failures = Object.entries(specs).filter(([metric, value]) => value > limit[metric]);
  const marginScores = Object.entries(specs).map(([metric, value]) => Math.max(0, 1 - Math.max(0, value - limit[metric]) / limit[metric]));
  let score = Math.round((marginScores.reduce((sum, value) => sum + value, 0) / marginScores.length) * 100);
  if (cargo.includes('Hazmat') || cargo.includes('LNG')) score -= 7;
  score = Math.max(0, Math.min(99, score));
  const result = qs('#eligibilityResult');
  result.classList.remove('warning', 'blocked');
  let title = 'Ready for pre-filing';
  let body = `${limit.name} demo limits passed. Create the transit filing package and notify the assigned agent.`;
  if (failures.length) {
    result.classList.add('blocked');
    title = 'Eligibility exception detected';
    body = `${failures.map(([metric]) => metric).join(', ')} exceeds the demo threshold for ${limit.name}. Escalate before filing.`;
    score = Math.min(score, 58);
  } else if (cargo.includes('Hazmat') || cargo.includes('LNG') || score < 86) {
    result.classList.add('warning');
    title = 'Eligible with compliance review';
    body = `${cargo} cargo requires extra validation. Attach supporting documents before submission.`;
  }
  qs('#eligibilityScore').textContent = `${score}%`;
  qs('.score-ring').style.setProperty('--score', `${score}%`);
  result.querySelector('h3').textContent = title;
  result.querySelector('p:not(.eyebrow)').textContent = body;
  toast('Eligibility check completed.');
}

function renderVessels() {
  const list = qs('#vesselList');
  const filtered = state.vessels.filter(vessel => state.fleetFilter === 'all' || vessel.status === state.fleetFilter);
  list.innerHTML = filtered.map(vessel => `
    <article class='vessel-item ${vessel.id === state.selectedVesselId ? 'is-selected' : ''}' data-vessel-id='${vessel.id}'>
      <div class='vessel-top'>
        <div>
          <h4>${vessel.name}</h4>
          <p>${vessel.owner} · ${vessel.waterway} · ETA ${vessel.eta}</p>
        </div>
        <span class='status-${vessel.status}'>${vessel.status}</span>
      </div>
      <div class='vessel-meta'>
        <span>Docs ${vessel.docs}</span>
        <span>${vessel.risk}</span>
        <span>${vessel.handoff}</span>
      </div>
    </article>
  `).join('');
  renderVesselDetail();
  updateFleetKpis();
}

function renderVesselDetail() {
  const vessel = state.vessels.find(item => item.id === state.selectedVesselId) || state.vessels[0];
  state.selectedVesselId = vessel.id;
  const detail = qs('#vesselDetail');
  detail.innerHTML = `
    <p class='eyebrow'>Selected vessel</p>
    <h3>${vessel.name}</h3>
    <p>${vessel.waterway} transit · ETA ${vessel.eta} · ${vessel.owner}</p>
    <div class='progress-stack'>
      <label>Filing package <span>${vessel.progress[0]}%</span><meter min='0' max='100' value='${vessel.progress[0]}'></meter></label>
      <label>Authority readiness <span>${vessel.progress[1]}%</span><meter min='0' max='100' value='${vessel.progress[1]}'></meter></label>
      <label>Agent handoff <span>${vessel.progress[2]}%</span><meter min='0' max='100' value='${vessel.progress[2]}'></meter></label>
    </div>
    <div class='detail-actions'>
      <button class='primary-btn' data-action='verifyDocs'>Mark docs verified</button>
      <button class='ghost-btn' data-action='createHandoff'>Create handoff</button>
    </div>
    <div class='mini-map' aria-hidden='true'>
      <div class='map-route'></div>
      <span class='port p1'></span><span class='port p2'></span><span class='port p3'></span>
      <span class='ship-dot'></span>
    </div>
  `;
}

function updateFleetKpis() {
  const risk = state.vessels.filter(v => v.status === 'risk').length;
  const cleared = state.vessels.filter(v => v.status === 'cleared').length;
  const avgDocs = Math.round(state.vessels.reduce((sum, v) => sum + v.progress[0], 0) / state.vessels.length);
  qs('#kpiActive').textContent = state.vessels.length * 4 + 4;
  qs('#kpiRisk').textContent = risk + 2;
  qs('#kpiDocs').textContent = `${avgDocs}%`;
  qs('#kpiHandoff').textContent = cleared + 6;
}

function selectVessel(id) {
  state.selectedVesselId = id;
  renderVessels();
}

function optimizeQueue() {
  state.vessels.sort((a, b) => {
    const rank = { risk: 0, filing: 1, cleared: 2 };
    return rank[a.status] - rank[b.status];
  });
  renderVessels();
  toast('Fleet queue optimized by risk and filing urgency.');
}

function verifyDocs() {
  const vessel = state.vessels.find(item => item.id === state.selectedVesselId);
  vessel.progress[0] = 100;
  vessel.docs = '9/9';
  if (vessel.status === 'risk') vessel.status = 'filing';
  renderVessels();
  toast(`${vessel.name} documents marked verified.`);
}

function createHandoff() {
  const vessel = state.vessels.find(item => item.id === state.selectedVesselId);
  vessel.handoff = 'Owner notified';
  vessel.progress[2] = Math.min(100, vessel.progress[2] + 22);
  renderVesselDetail();
  renderVessels();
  toast(`Agent-to-owner handoff created for ${vessel.name}.`);
}

function calculateRoutes(event) {
  if (event) event.preventDefault();
  const profile = qs('#routeVessel').value;
  const fuel = Number(qs('#fuelRange').value);
  const sensitivity = Number(qs('#delaySensitivity').value);
  const origin = qs('#origin').value;
  const destination = qs('#destination').value;
  const options = routeBase[profile].map(option => {
    const delayCost = option.days * fuel * option.delay * sensitivity;
    const total = option.toll + option.days * fuel + delayCost;
    return { ...option, delayCost, total };
  }).sort((a, b) => a.total - b.total);
  const max = Math.max(...options.map(option => option.total));
  const results = qs('#routeResults');
  qs('#bestRoute').textContent = options[0].name;
  results.innerHTML = options.map((option, index) => `
    <article class='route-option ${index === 0 ? 'best' : ''}'>
      <div class='route-top'>
        <div>
          <h4>${index === 0 ? 'Recommended · ' : ''}${option.name}</h4>
          <p>${origin} → ${destination} · ${option.confidence}% confidence</p>
        </div>
        <span class='status-pill'>${money.format(option.total)}</span>
      </div>
      <div class='route-metrics'>
        <div><span>Toll</span><strong>${money.format(option.toll)}</strong></div>
        <div><span>Days</span><strong>${option.days}</strong></div>
        <div><span>Delay risk</span><strong>${Math.round(option.delay * sensitivity * 100)}%</strong></div>
        <div><span>Fuel</span><strong>${money.format(option.days * fuel)}</strong></div>
      </div>
      <div class='cost-bar'><span style='width:${Math.max(8, (option.total / max) * 100)}%'></span></div>
    </article>
  `).join('');
  toast('Route comparison recalculated.');
}

function renderPipeline() {
  const track = qs('#weekTrack');
  track.innerHTML = Array.from({ length: 10 }, (_, i) => `
    <button class='${state.currentWeek === i + 1 ? 'is-active' : ''}' data-week='${i + 1}'>W${i + 1}</button>
  `).join('');
  const weekData = pipeline[state.currentWeek];
  const products = [
    ['Regulatory Alerts', '4–6 week launch path', weekData.alerts],
    ['Fleet Operations', '8–10 week main effort', weekData.fleet],
    ['Toll + Route', '6 week launch path', weekData.routes]
  ];
  qs('#pipelineGrid').innerHTML = products.map(([name, subtitle, tasks]) => `
    <article class='pipeline-item'>
      <p class='eyebrow'>${subtitle}</p>
      <h3>${name}</h3>
      <p>Week ${state.currentWeek} focus</p>
      <ul>${tasks.map(task => `<li>${task}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function setWeek(week) {
  state.currentWeek = Number(week);
  renderPipeline();
}

function advanceWeek() {
  state.currentWeek = state.currentWeek === 10 ? 1 : state.currentWeek + 1;
  renderPipeline();
  toast(`Pipeline advanced to week ${state.currentWeek}.`);
}

function exportBrief() {
  const best = qs('#bestRoute').textContent;
  toast(`Decision brief prepared: recommended route is ${best}.`);
}

function openFiling() {
  setView('fleet');
  toast('Opened linked fleet filing workspace.');
}

function toast(message) {
  const toastEl = qs('#toast');
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  window.clearTimeout(toastEl.hideTimer);
  toastEl.hideTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
}

function animateCounts() {
  qsa('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 42));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, 28);
  });
}

function addRipple(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height);
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
  circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
  circle.className = 'ripple';
  button.appendChild(circle);
  setTimeout(() => circle.remove(), 680);
}

function initTilt() {
  qsa('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function handleClick(event) {
  const navTarget = event.target.closest('[data-nav]');
  if (navTarget) setView(navTarget.dataset.nav);

  const actionTarget = event.target.closest('[data-action]');
  if (actionTarget) {
    const { action, id } = actionTarget.dataset;
    const actionMap = {
      simulateAlert,
      ackAll,
      ackAlert: () => acknowledgeAlert(id),
      openFiling,
      optimizeQueue,
      verifyDocs,
      createHandoff,
      calculateRoutes,
      exportBrief,
      advanceWeek
    };
    if (actionMap[action]) actionMap[action]();
  }

  const vessel = event.target.closest('[data-vessel-id]');
  if (vessel) selectVessel(vessel.dataset.vesselId);

  const week = event.target.closest('[data-week]');
  if (week) setWeek(week.dataset.week);
}

function bindEvents() {
  document.addEventListener('click', handleClick);
  qsa('button').forEach(button => button.addEventListener('click', addRipple));
  qs('#eligibilityForm').addEventListener('submit', runEligibility);
  qs('#routeForm').addEventListener('submit', calculateRoutes);
  qs('#fuelRange').addEventListener('input', event => {
    qs('#fuelLabel').textContent = money.format(Number(event.target.value));
  });
  qsa('.segmented button').forEach(button => {
    button.addEventListener('click', () => {
      qsa('.segmented button').forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      state.fleetFilter = button.dataset.filter;
      renderVessels();
    });
  });
  qs('#mobileMenu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
}

function init() {
  const initialView = location.hash?.replace('#', '') || 'overview';
  renderAlerts();
  renderVessels();
  calculateRoutes();
  renderPipeline();
  bindEvents();
  initTilt();
  setView(['overview', 'alerts', 'fleet', 'routes', 'pipeline'].includes(initialView) ? initialView : 'overview');
  animateCounts();
}

init();
