// middleware/JwtAuth.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

// Middleware to verify JWT token from cookie
const jsonwebtoken = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SIGN);
        req.payload = decoded;

        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found." }); 
        }
        req.user = user; 

        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }
};


const generateJWT = (userData) => {
    return jwt.sign(userData, process.env.JWT_SIGN, { expiresIn: "1d" });
};

module.exports = { jsonwebtoken, generateJWT };