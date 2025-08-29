const express = require("express");
const router = express.Router();
const { 
    signup, 
    login, 
    logout, 
    verifyToken, 
    getProfile, 
    updateProfile 
} = require("../controllers/authController");
const { jsonwebtoken } = require("../middleware/JwtAuth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-token", jsonwebtoken, verifyToken);

// ✨ NEW: Profile routes
router.get("/profile", jsonwebtoken, getProfile);
router.put("/profile", jsonwebtoken, updateProfile);

module.exports = router;