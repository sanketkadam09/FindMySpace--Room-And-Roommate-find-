// controllers/matchController.js
const User = require("../models/User");

// ✨ NEW: Calculate compatibility percentage between two users
const calculateCompatibility = (user1, user2) => {
    let score = 0;
    let totalFactors = 0;

    // Basic compatibility factors
    const factors = [
        { name: 'sleepSchedule', weight: 15 },
        { name: 'foodHabit', weight: 10 },
        { name: 'noiseTolerance', weight: 15 },
        { name: 'cleanlinessLevel', weight: 15 },
        { name: 'petsAllowed', weight: 10 },
        { name: 'smoking', weight: 10 },
        { name: 'timePreference', weight: 15 },
        { name: 'budgetCompatibility', weight: 10 }
    ];

    factors.forEach(factor => {
        if (factor.name === 'budgetCompatibility') {
            // Calculate budget compatibility using min/max budget range
            const budget1 = user1.roomDetails?.budget || 
                         (user1.preferences?.minBudget && user1.preferences?.maxBudget ? 
                          (parseInt(user1.preferences.minBudget) + parseInt(user1.preferences.maxBudget)) / 2 : null);
            
            const budget2 = user2.roomDetails?.budget || 
                         (user2.preferences?.minBudget && user2.preferences?.maxBudget ? 
                          (parseInt(user2.preferences.minBudget) + parseInt(user2.preferences.maxBudget)) / 2 : null);
            
            if (budget1 && budget2) {
                // Calculate compatibility based on budget overlap
                const min1 = user1.roomDetails?.budget ? budget1 * 0.9 : parseInt(user1.preferences?.minBudget || 0);
                const max1 = user1.roomDetails?.budget ? budget1 * 1.1 : parseInt(user1.preferences?.maxBudget || Infinity);
                const min2 = user2.roomDetails?.budget ? budget2 * 0.9 : parseInt(user2.preferences?.minBudget || 0);
                const max2 = user2.roomDetails?.budget ? budget2 * 1.1 : parseInt(user2.preferences?.maxBudget || Infinity);
                
                // Calculate overlap
                const overlapMin = Math.max(min1, min2);
                const overlapMax = Math.min(max1, max2);
                
                // If there's an overlap, calculate compatibility based on the overlap size
                if (overlapMin <= overlapMax) {
                    const overlapSize = overlapMax - overlapMin;
                    const totalRange = Math.max(max1, max2) - Math.min(min1, min2);
                    const compatibility = (overlapSize / totalRange) * 100;
                    score += (compatibility / 100) * factor.weight;
                }
            }
        } else if (factor.name === 'timePreference') {
            // Handle time preference compatibility
            const time1 = user1.preferences?.timePreference || 'flexible';
            const time2 = user2.preferences?.timePreference || 'flexible';
            
            if (time1 === 'flexible' || time2 === 'flexible' || time1 === time2) {
                score += factor.weight; // Full score if either is flexible or they match
            } else {
                // Partial score for some combinations
                const timeCompatibility = getTimeCompatibility(time1, time2);
                score += (timeCompatibility / 100) * factor.weight;
            }
        } else {
            // Compare other preferences
            const pref1 = user1.preferences?.[factor.name];
            const pref2 = user2.preferences?.[factor.name];
            
            if (pref1 && pref2) {
                if (pref1 === pref2) {
                    score += factor.weight;
                } else if (factor.name === 'sleepSchedule' || factor.name === 'noiseTolerance') {
                    // Partial compatibility for some factors
                    const compatibility = getPartialCompatibility(pref1, pref2, factor.name);
                    score += (compatibility / 100) * factor.weight;
                }
            }
        }
        totalFactors += factor.weight;
    });

    return Math.round((score / totalFactors) * 100);
};

// ✨ NEW: Get time preference compatibility
const getTimeCompatibility = (time1, time2) => {
    const timeMatrix = {
        'morning': { 'morning': 100, 'afternoon': 60, 'evening': 30 },
        'afternoon': { 'morning': 60, 'afternoon': 100, 'evening': 60 },
        'evening': { 'morning': 30, 'afternoon': 60, 'evening': 100 },
    };
    
    return timeMatrix[time1]?.[time2] || 50; // Default to 50% if not found
};

// ✨ NEW: Get partial compatibility for certain factors
const getPartialCompatibility = (pref1, pref2, factorName) => {
    const compatibilityMatrix = {
        sleepSchedule: {
            'early': { 'early': 100, 'late': 30, 'flexible': 70 },
            'late': { 'early': 30, 'late': 100, 'flexible': 70 },
            'flexible': { 'early': 70, 'late': 70, 'flexible': 100 }
        },
        noiseTolerance: {
            'low': { 'low': 100, 'moderate': 60, 'high': 20 },
            'moderate': { 'low': 60, 'moderate': 100, 'high': 60 },
            'high': { 'low': 20, 'moderate': 60, 'high': 100 }
        }
    };

    return compatibilityMatrix[factorName]?.[pref1]?.[pref2] || 0;
};

// ✨ NEW: Get compatible users for a given user
exports.getCompatibleUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.payload.id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let targetRoles = [];
        let targetSubRoles = [];

        // Determine compatible user types based on current user's role
        switch (currentUser.role) {
            case 'owner':
                // Room owners can match with seekers and roommate seekers
                targetRoles = ['seeker', 'roommate'];
                break;
            case 'seeker':
                // Room seekers can match with owners
                targetRoles = ['owner'];
                break;
            case 'roommate':
                // Roommate seekers can match with owners and other roommate seekers
                targetRoles = ['owner', 'roommate'];
                if (currentUser.subRole === 'hasRoom') {
                    targetSubRoles = ['noRoom'];
                } else if (currentUser.subRole === 'noRoom') {
                    targetSubRoles = ['hasRoom'];
                }
                break;
        }

        // Build query
        let query = {
            _id: { $ne: currentUser._id },
            isActive: true,
            profileComplete: true,
            role: { $in: targetRoles }
        };

        if (targetSubRoles.length > 0) {
            query.subRole = { $in: targetSubRoles };
        }

        // Get compatible users
        const compatibleUsers = await User.find(query)
            .select('name gender preferences roomDetails roommatePreferences profileImage role subRole')
            .limit(20);

        // Calculate compatibility scores
        const usersWithScores = compatibleUsers.map(user => {
            const compatibility = calculateCompatibility(currentUser, user);
            return {
                ...user.toObject(),
                compatibilityScore: compatibility
            };
        });

        // Sort by compatibility score (highest first)
        usersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        res.status(200).json({
            users: usersWithScores,
            currentUserRole: currentUser.role,
            currentUserSubRole: currentUser.subRole
        });

    } catch (error) {
        console.error("Get compatible users error:", error);
        res.status(500).json({ message: "Error fetching compatible users", error: error.message });
    }
};

// ✨ NEW: Get detailed compatibility analysis
exports.getCompatibilityAnalysis = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUser = await User.findById(req.payload.id);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const compatibility = calculateCompatibility(currentUser, targetUser);

        // Detailed analysis
        const analysis = {
            overallScore: compatibility,
            factors: {
                sleepSchedule: {
                    user1: currentUser.preferences?.sleepSchedule,
                    user2: targetUser.preferences?.sleepSchedule,
                    compatibility: getPartialCompatibility(
                        currentUser.preferences?.sleepSchedule,
                        targetUser.preferences?.sleepSchedule,
                        'sleepSchedule'
                    )
                },
                foodHabit: {
                    user1: currentUser.preferences?.foodHabit,
                    user2: targetUser.preferences?.foodHabit,
                    compatibility: currentUser.preferences?.foodHabit === targetUser.preferences?.foodHabit ? 100 : 0
                },
                noiseTolerance: {
                    user1: currentUser.preferences?.noiseTolerance,
                    user2: targetUser.preferences?.noiseTolerance,
                    compatibility: getPartialCompatibility(
                        currentUser.preferences?.noiseTolerance,
                        targetUser.preferences?.noiseTolerance,
                        'noiseTolerance'
                    )
                },
                cleanlinessLevel: {
                    user1: currentUser.preferences?.cleanlinessLevel,
                    user2: targetUser.preferences?.cleanlinessLevel,
                    compatibility: currentUser.preferences?.cleanlinessLevel === targetUser.preferences?.cleanlinessLevel ? 100 : 0
                },
                petsAllowed: {
                    user1: currentUser.preferences?.petsAllowed,
                    user2: targetUser.preferences?.petsAllowed,
                    compatibility: currentUser.preferences?.petsAllowed === targetUser.preferences?.petsAllowed ? 100 : 0
                },
                smoking: {
                    user1: currentUser.preferences?.smoking,
                    user2: targetUser.preferences?.smoking,
                    compatibility: currentUser.preferences?.smoking === targetUser.preferences?.smoking ? 100 : 0
                },
                timePreference: {
                    user1: currentUser.preferences?.timePreference,
                    user2: targetUser.preferences?.timePreference,
                    compatibility: getTimeCompatibility(
                        currentUser.preferences?.timePreference,
                        targetUser.preferences?.timePreference
                    )
                }
            }
        };

        res.status(200).json({
            analysis,
            targetUser: {
                id: targetUser._id,
                name: targetUser.name,
                gender: targetUser.gender,
                role: targetUser.role,
                subRole: targetUser.subRole,
                profileImage: targetUser.profileImage,
                roomDetails: targetUser.roomDetails,
                roommatePreferences: targetUser.roommatePreferences
            }
        });

    } catch (error) {
        console.error("Get compatibility analysis error:", error);
        res.status(500).json({ message: "Error analyzing compatibility", error: error.message });
    }
};

// ✨ NEW: Get potential roommates for roommate seekers
exports.getPotentialRoommates = async (req, res) => {
    try {
        const currentUser = await User.findById(req.payload.id);
        if (!currentUser || currentUser.role !== 'roommate') {
            return res.status(403).json({ message: "Only roommate seekers can access this endpoint" });
        }

        let query = {
            _id: { $ne: currentUser._id },
            isActive: true,
            profileComplete: true,
            role: 'roommate'
        };

        // Find complementary roommate seekers
        if (currentUser.subRole === 'hasRoom') {
            query.subRole = 'noRoom';
        } else if (currentUser.subRole === 'noRoom') {
            query.subRole = 'hasRoom';
        }

        const potentialRoommates = await User.find(query)
            .select('name gender preferences roommatePreferences profileImage subRole')
            .limit(15);

        // Calculate compatibility and add scores
        const roommatesWithScores = potentialRoommates.map(roommate => {
            const compatibility = calculateCompatibility(currentUser, roommate);
            return {
                ...roommate.toObject(),
                compatibilityScore: compatibility
            };
        });

        // Sort by compatibility score
        roommatesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        res.status(200).json({
            potentialRoommates: roommatesWithScores,
            currentUserSubRole: currentUser.subRole
        });

    } catch (error) {
        console.error("Get potential roommates error:", error);
        res.status(500).json({ message: "Error fetching potential roommates", error: error.message });
    }
};

// ✨ NEW: Get available rooms for room seekers
exports.getAvailableRooms = async (req, res) => {
    try {
        const currentUser = await User.findById(req.payload.id);
        if (!currentUser || currentUser.role !== 'seeker') {
            return res.status(403).json({ message: "Only room seekers can access this endpoint" });
        }

        // Find users with rooms (owners and roommate seekers with rooms)
        const query = {
            _id: { $ne: currentUser._id },
            isActive: true,
            profileComplete: true,
            $or: [
                { role: 'owner' },
                { role: 'roommate', subRole: 'hasRoom' }
            ]
        };

        const roomOwners = await User.find(query)
            .select('name gender preferences roomDetails profileImage role subRole')
            .limit(20);

        // Calculate compatibility and add scores
        const roomsWithScores = roomOwners.map(owner => {
            const compatibility = calculateCompatibility(currentUser, owner);
            return {
                ...owner.toObject(),
                compatibilityScore: compatibility
            };
        });

        // Sort by compatibility score
        roomsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        res.status(200).json({
            availableRooms: roomsWithScores
        });

    } catch (error) {
        console.error("Get available rooms error:", error);
        res.status(500).json({ message: "Error fetching available rooms", error: error.message });
    }
};
