const Profile = require("../models/Profile");
const User = require("../models/User");

// Create or update user profile
const createOrUpdateProfile = async (req, res) => {
    try {
        const {
            bio,
            birthdate,
            gender,
            interestedIn,
            location,
            occupation,
            interests,
            photos,
            relationshipGoals,
            height,
            physicalActivity,
            smoking,
            drinking,
            religion,
            languages
        } = req.body;

        // Calculate age from birthdate
        const age = birthdate ? calculateAge(birthdate) : null;

        // Find existing profile or create new one
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update existing profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                {
                    bio,
                    birthdate,
                    age,
                    gender,
                    interestedIn,
                    location,
                    occupation,
                    interests,
                    photos,
                    relationshipGoals,
                    height,
                    physicalActivity,
                    smoking,
                    drinking,
                    religion,
                    languages,
                    lastUpdated: Date.now()
                },
                { new: true }
            );
        } else {
            // Create new profile
            profile = new Profile({
                user: req.user.id,
                bio,
                birthdate,
                age,
                gender,
                interestedIn,
                location,
                occupation,
                interests,
                photos,
                relationshipGoals,
                height,
                physicalActivity,
                smoking,
                drinking,
                religion,
                languages
            });

            await profile.save();
        }

        // Get user info to include with profile response
        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            data: {
                profile,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    username: user.username
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get current user's profile
const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // Get user info to include with profile response
        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            data: {
                profile,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    username: user.username
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get profile by ID (for viewing other profiles)
const getProfileById = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // Get basic user info to include with profile response
        const user = await User.findById(profile.user).select("fullname username");

        res.status(200).json({
            success: true,
            data: {
                profile,
                user
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get profiles matching filters (for discovery)
const discoverProfiles = async (req, res) => {
    try {
        const {
            gender,
            minAge,
            maxAge,
            location,
            interests,
            relationshipGoals,
            limit = 10,
            page = 1
        } = req.query;

        // Build filter query
        const filterQuery = {};
        
        // Don't show current user's profile in results
        filterQuery.user = { $ne: req.user.id };
        
        // Filter by gender if provided
        if (gender) {
            filterQuery.gender = gender;
        }
        
        // Filter by age range if provided
        if (minAge || maxAge) {
            filterQuery.age = {};
            if (minAge) filterQuery.age.$gte = Number(minAge);
            if (maxAge) filterQuery.age.$lte = Number(maxAge);
        }
        
        // Filter by location if provided
        if (location) {
            filterQuery.location = { $regex: location, $options: 'i' };
        }
        
        // Filter by interests if provided
        if (interests) {
            const interestsArray = interests.split(',').map(interest => interest.trim());
            filterQuery.interests = { $in: interestsArray };
        }
        
        // Filter by relationship goals if provided
        if (relationshipGoals) {
            filterQuery.relationshipGoals = relationshipGoals;
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        
        // Execute query with pagination
        const profiles = await Profile.find(filterQuery)
            .sort({ lastUpdated: -1 })
            .skip(skip)
            .limit(Number(limit));
            
        // Get total count for pagination
        const total = await Profile.countDocuments(filterQuery);
        
        // Get user info for each profile
        const profilesWithUserInfo = await Promise.all(
            profiles.map(async (profile) => {
                const user = await User.findById(profile.user).select("fullname username");
                return {
                    profile,
                    user
                };
            })
        );

        res.status(200).json({
            success: true,
            count: profiles.length,
            total,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            },
            data: profilesWithUserInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Delete profile
const deleteProfile = async (req, res) => {
    try {
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        
        res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Helper function to calculate age from birthdate
const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

module.exports = {
    createOrUpdateProfile,
    getMyProfile,
    getProfileById,
    discoverProfiles,
    deleteProfile
};