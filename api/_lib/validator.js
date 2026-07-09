const { validateTransit } = require('../_demoData');
const { findWaterway } = require('./store');

function normalizeDocumentPacket(payload = {}) {
  const docs = new Set(Array.isArray(payload.docs) ? payload.docs : []);
  if (Array.isArray(payload.documents)) {
    payload.documents.forEach(doc => {
      if (doc.docType) docs.add(doc.docType);
      if (doc.detectedType) docs.add(doc.detectedType);
      if (doc.name) docs.add(doc.name);
    });
  }
  return [...docs].filter(Boolean);
}

function buildValidationReport(payload = {}) {
  const waterway = findWaterway(payload.waterway || payload.waterwayId);
  const vessel = payload.vessel || payload;
  const docs = normalizeDocumentPacket(payload);
  const result = validateTransit({ waterway: waterway.id, vessel, docs });
  const readiness = {
    dimensions: result.issues.filter(i => i.type === 'dimension_exceeded' || i.type === 'missing_dimension').length === 0,
    documents: result.issues.filter(i => i.type === 'missing_document').length === 0,
    cargo: result.issues.filter(i => i.type === 'cargo_doc_missing').length === 0,
    authorityWindow: result.bookingWindowHours <= 96
  };
  const nextActions = [];
  if (!readiness.dimensions) nextActions.push('Escalate vessel dimension exception before filing.');
  if (!readiness.documents) nextActions.push('Upload or complete all required authority documents.');
  if (!readiness.cargo) nextActions.push('Attach cargo-specific declaration before submission.');
  if (!nextActions.length) nextActions.push('Package is ready for demo pre-filing workflow.');
  return { ...result, readiness, nextActions, validationId: `val_${Date.now()}` };
}

module.exports = { buildValidationReport, normalizeDocumentPacket };
