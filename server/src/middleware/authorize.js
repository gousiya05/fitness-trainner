/**
 * Role-based access middleware.
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      error: `Access denied: requires role [${roles.join(' | ')}]`,
    });
  }
  next();
};

module.exports = { authorize };
