const { send, methodGuard, parseBody } = require('../_lib/http');
const { reviewDocuments } = require('../_lib/documentAgent');

module.exports = function handler(req, res) {
  if (methodGuard(req, res, ['GET', 'POST'])) return;
  if (req.method === 'GET') {
    return send(res, 200, { message: 'POST uploaded document metadata/text and fillable form fields for AI-style demo review.' });
  }
  const payload = parseBody(req);
  return send(res, 200, { review: reviewDocuments(payload) });
};
