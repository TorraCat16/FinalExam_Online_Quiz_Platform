// Restricts access to specific roles
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};
