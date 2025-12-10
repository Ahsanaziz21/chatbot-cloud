// api/health.js - Simple healthcheck for Vercel
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};
