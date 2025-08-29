exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.payload.role;
    
    // ✨ UPDATED: Handle new role system
    if (!userRole) {
      return res.status(403).json({ message: "Access denied: No role found" });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied: Role '${userRole}' not allowed. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
};
