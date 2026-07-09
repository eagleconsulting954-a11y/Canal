const { findWaterway } = require('./store');
const { buildValidationReport } = require('./validator');

function normalize(value) {
  return String(value || '').toLowerCase();
}

function detectDocumentType(file = {}, requiredDocs = []) {
  const haystack = normalize(`${file.docType || ''} ${file.name || ''} ${file.text || ''} ${file.type || ''}`);
  return requiredDocs.find(doc => normalize(doc).split(/\s+/).some(token => token.length > 3 && haystack.includes(token))) || file.docType || 'Unclassified Document';
}

function compareField(label, expected, observed) {
  if (!expected || !observed) return { label, status: 'missing', confidence: 0, message: `${label} could not be confirmed.` };
  const e = normalize(expected).replace(/\s+/g, '');
  const o = normalize(observed).replace(/\s+/g, '');
  const matched = e.includes(o) || o.includes(e);
  return { label, status: matched ? 'matched' : 'review', confidence: matched ? 98 : 64, message: matched ? `${label} matched.` : `${label} does not fully match.` };
}

function reviewDocuments(payload = {}) {
  const waterway = findWaterway(payload.waterway || payload.waterwayId);
  const vessel = payload.vessel || {};
  const form = payload.form || {};
  const files = Array.isArray(payload.files) ? payload.files : [];
  const detectedDocuments = files.map(file => ({
    id: `doc_${Math.random().toString(16).slice(2)}`,
    name: file.name || file.docType || 'Filled document',
    type: file.type || 'fillable-form',
    size: file.size || 0,
    detectedType: detectDocumentType(file, waterway.requiredDocs),
    confidence: file.text ? 91 : file.docType ? 86 : 58,
    readableText: Boolean(file.text),
    reviewNotes: file.text ? 'Document text was available to the demo agent.' : 'Demo agent reviewed metadata/form fields. Add OCR/extraction for production.'
  }));
  const uploadedDocTypes = [...new Set(detectedDocuments.map(doc => doc.detectedType).filter(type => type !== 'Unclassified Document'))];
  const fieldChecks = [
    compareField('Vessel name', vessel.name, form.vesselName),
    compareField('IMO number', vessel.imo, form.imo),
    compareField('Owner', vessel.owner, form.owner),
    compareField('Cargo', vessel.cargo, form.cargo)
  ];
  const missingRequiredDocs = waterway.requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));
  const reviewIssues = [
    ...fieldChecks.filter(check => check.status !== 'matched').map(check => check.message),
    ...missingRequiredDocs.map(doc => `${doc} is missing from the packet.`)
  ];
  const validation = buildValidationReport({ waterway: waterway.id, vessel, docs: uploadedDocTypes });
  const averageFieldConfidence = fieldChecks.reduce((sum, check) => sum + check.confidence, 0) / fieldChecks.length;
  const score = Math.max(0, Math.round((validation.score + averageFieldConfidence) / 2 - missingRequiredDocs.length * 3));
  return {
    reviewId: `review_${Date.now()}`,
    demoMode: true,
    status: reviewIssues.length ? 'needs_review' : 'agent_verified',
    score,
    waterway: waterway.name,
    authority: waterway.authority,
    detectedDocuments,
    uploadedDocTypes,
    missingRequiredDocs,
    fieldChecks,
    reviewIssues,
    validation,
    recommendation: reviewIssues.length ? 'Resolve document gaps and field mismatches before filing.' : 'Document packet looks ready for demo pre-filing.'
  };
}

module.exports = { reviewDocuments, detectDocumentType, compareField };
