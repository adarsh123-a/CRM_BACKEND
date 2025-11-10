// Middleware to check if user has required roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // User has required role, proceed to next middleware
    next();
  };
}

module.exports = authorizeRoles;
