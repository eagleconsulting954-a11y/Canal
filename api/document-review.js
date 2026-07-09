const { waterwayRules, validateTransit } = require('./_demoData');

function normalize(value) {
  return String(value || '').toLowerCase();
}

function findDocType(file, requiredDocs) {
  const haystack = normalize(`${file.name} ${file.text || ''} ${file.type || ''}`);
  return requiredDocs.find(doc => {
    const tokens = normalize(doc).split(/\s+/).filter(Boolean);
    return tokens.some(token => token.length > 3 && haystack.includes(token));
  }) || 'Unclassified Document';
}

function scoreFieldMatch(label, expected, observed) {
  if (!expected || !observed) return { label, status: 'missing', confidence: 0, message: `${label} could not be confirmed.` };
  const e = normalize(expected).replace(/\s+/g, '');
  const o = normalize(observed).replace(/\s+/g, '');
  const match = e && o && (e.includes(o) || o.includes(e));
  return { label, status: match ? 'matched' : 'review', confidence: match ? 98 : 62, message: match ? `${label} matched the vessel record.` : `${label} does not fully match the vessel record.` };
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ demoMode: true, message: 'POST uploaded document metadata, extracted text, and filled form fields to run the CanalClear demo review agent.' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST for document review.' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const waterway = waterwayRules[payload.waterway] || waterwayRules.panama;
    const vessel = payload.vessel || {};
    const form = payload.form || {};
    const files = Array.isArray(payload.files) ? payload.files : [];
    const detected = files.map(file => ({
      name: file.name,
      size: file.size || 0,
      type: file.type || 'unknown',
      detectedType: findDocType(file, waterway.requiredDocs),
      readableText: Boolean(file.text),
      confidence: file.text ? 91 : 58,
      notes: file.text ? 'Text was available for demo review.' : 'File metadata was reviewed. Add text/PDF extraction for production review.'
    }));
    const uploadedDocTypes = [...new Set(detected.map(d => d.detectedType).filter(d => d !== 'Unclassified Document'))];
    const prevalidation = validateTransit({ waterway: waterway.id, vessel, docs: uploadedDocTypes });
    const fieldChecks = [
      scoreFieldMatch('Vessel name', vessel.name, form.vesselName),
      scoreFieldMatch('IMO number', vessel.imo, form.imo),
      scoreFieldMatch('Owner', vessel.owner, form.owner),
      scoreFieldMatch('Cargo', vessel.cargo, form.cargo)
    ];
    const missingRequiredDocs = waterway.requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));
    const reviewIssues = [
      ...fieldChecks.filter(c => c.status !== 'matched').map(c => c.message),
      ...missingRequiredDocs.map(doc => `${doc} is still missing from the upload set.`)
    ];
    const score = Math.max(0, Math.round((prevalidation.score + fieldChecks.reduce((sum, c) => sum + c.confidence, 0) / fieldChecks.length) / 2 - missingRequiredDocs.length * 3));
    const status = reviewIssues.length ? 'needs_review' : 'agent_verified';
    return res.status(200).json({ demoMode: true, status, score, waterway: waterway.name, detectedDocuments: detected, uploadedDocTypes, missingRequiredDocs, fieldChecks, reviewIssues, prevalidation, recommendation: reviewIssues.length ? 'Review highlighted mismatches and missing documents before filing.' : 'Document packet looks ready for demo pre-filing.' });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid document review payload', details: error.message });
  }
};
