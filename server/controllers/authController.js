// controllers/authController.js
const User = require("../models/User");
const { generateJWT } = require("../middleware/JwtAuth");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
};

// Validation for signup
const validateSignupData = (data) => {
    const errors = [];
    
    // Validate required fields
    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.password?.trim()) errors.push('Password is required');
    if (!data.gender) errors.push('Gender is required');
    if (!data.role) errors.push('Role is required');
    
    // Validate role
    if (data.role && !['owner', 'seeker', 'roommate'].includes(data.role)) {
        errors.push('Invalid role selected');
    }
    
    // Validate sub-role for roommates
    if (data.role === 'roommate' && !data.subRole) {
        errors.push('Please specify if you have a room or not');
    }
    
    return errors;
};

exports.signup = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            gender, 
            role, 
            subRole,
            contactInfo
        } = req.body;

        if (role === "admin") {
            return res.status(403).json({ message: "You are not allowed to register as an admin." });
        }

        // Validate signup data
        const validationErrors = validateSignupData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: validationErrors 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create user with validated data
        const userData = {
            name, 
            email, 
            password, 
            gender, 
            role,
            contactInfo: {
                ...contactInfo,
                email,
                phone: contactInfo?.phone || '',
                preferredContact: contactInfo?.preferredContact || 'email'
            },
            profileComplete: false
        };

        // Add subRole only if role is roommate
        if (role === 'roommate') {
            userData.subRole = subRole;
        }

        const newUser = new User(userData);
        await newUser.save();

        // Generate token with user info
        const token = generateJWT({ 
            id: newUser._id, 
            email, 
            name, 
            role: newUser.role,
            subRole: newUser.subRole
        });
        
        res.cookie("jwt", token, cookieOptions);
        
        // Return user data without sensitive information
        res.status(201).json({
            message: "User created successfully", 
            user: { 
                id: newUser._id,
                name, 
                email, 
                role: newUser.role,
                subRole: newUser.subRole,
                profileComplete: newUser.profileComplete
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation failed", 
                errors 
            });
        }
        
        res.status(500).json({ message: "Signup error", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        // Generate token with user info
        const token = generateJWT({ 
            id: user._id, 
            email, 
            name: user.name, 
            role: user.role,
            subRole: user.subRole
        });
        
        res.cookie("jwt", token, cookieOptions);
        
        // Return user data without sensitive information
        res.status(200).json({ 
            message: "Login successful", 
            user: { 
                id: user._id,
                name: user.name, 
                email, 
                role: user.role,
                subRole: user.subRole,
                profileComplete: user.profileComplete
            } 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login error", error: error.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
};

exports.verifyToken = (req, res) => {
    if (!req.payload) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.status(200).json({ 
        message: "Token is valid", 
        user: req.payload 
    });
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.payload.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { 
            name, 
            gender, 
            preferences, 
            contactInfo
        } = req.body;

        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields
        if (name) user.name = name;
        if (gender) user.gender = gender;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        if (contactInfo) user.contactInfo = { ...user.contactInfo, ...contactInfo };

        // Mark profile as complete
        user.profileComplete = true;

        await user.save();

        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subRole: user.subRole,
                profileComplete: user.profileComplete
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation failed", 
                errors 
            });
        }
        
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};