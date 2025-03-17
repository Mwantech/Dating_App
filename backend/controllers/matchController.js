// controllers/matchController.js
const User = require("../models/User");
const Profile = require("../models/Profile");

// Make sure to export the functions correctly
const matchController = {
  // Get matches for the current user
  getMatches: async (req, res) => {
    try {
      // Get current user's profile
      const userProfile = await Profile.findOne({ user: req.user.id }).populate("user", "username");
      
      if (!userProfile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }

      // Define matching criteria based on user preferences
      const matchCriteria = {
        user: { $ne: req.user.id }, // Exclude current user
        isProfileComplete: true,     // Only include complete profiles
      };

      // Match gender preference if specified
      if (userProfile.interestedIn && userProfile.interestedIn.length > 0) {
        matchCriteria.gender = { $in: userProfile.interestedIn };
      }

      // Match relationship goals if specified
      if (userProfile.relationshipGoals) {
        matchCriteria.relationshipGoals = userProfile.relationshipGoals;
      }

      // Get matching profiles
      const matches = await Profile.find(matchCriteria)
        .populate("user", "username fullname")
        .select("-__v")
        .limit(20); // Limit results

      // Calculate compatibility score for each match
      const matchesWithScore = matches.map(match => {
        const compatibilityScore = calculateCompatibilityScore(userProfile, match);
        return {
          ...match.toObject(),
          compatibilityScore
        };
      });

      // Sort by compatibility score
      const sortedMatches = matchesWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      res.json({
        success: true,
        count: sortedMatches.length,
        matches: sortedMatches
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get recommended matches for the current user (more diverse suggestions)
  getRecommendedMatches: async (req, res) => {
    try {
      const userProfile = await Profile.findOne({ user: req.user.id });
      
      if (!userProfile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }

      // Basic criteria - more relaxed than getMatches
      const matchCriteria = {
        user: { $ne: req.user.id },
        isProfileComplete: true
      };

      // Match gender preference if specified
      if (userProfile.interestedIn && userProfile.interestedIn.length > 0) {
        matchCriteria.gender = { $in: userProfile.interestedIn };
      }

      // Get potential matches
      const potentialMatches = await Profile.find(matchCriteria)
        .populate("user", "username fullname")
        .select("-__v")
        .limit(50); // Get more potential matches for diversity
      
      // Calculate compatibility but prioritize diversity for recommendations
      const matchesWithScore = potentialMatches.map(match => {
        const compatibilityScore = calculateCompatibilityScore(userProfile, match);
        const diversityBonus = calculateDiversityBonus(userProfile, match);
        return {
          ...match.toObject(),
          compatibilityScore: compatibilityScore + diversityBonus
        };
      });

      // Sort by modified score
      const recommendations = matchesWithScore
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 20); // Return top 20

      res.json({
        success: true,
        count: recommendations.length,
        recommendations
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get filtered matches based on custom criteria
  getFilteredMatches: async (req, res) => {
    try {
      const {
        minAge,
        maxAge,
        relationshipGoals,
        physicalActivity,
        location,
        interests,
        maxDistance
      } = req.body;

      // Get current user's profile
      const userProfile = await Profile.findOne({ user: req.user.id });
      
      if (!userProfile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }

      // Build filter criteria
      const filterCriteria = {
        user: { $ne: req.user.id },
        isProfileComplete: true
      };

      // Match gender preference if specified
      if (userProfile.interestedIn && userProfile.interestedIn.length > 0) {
        filterCriteria.gender = { $in: userProfile.interestedIn };
      }

      // Apply age filter if provided
      if (minAge || maxAge) {
        filterCriteria.age = {};
        if (minAge) filterCriteria.age.$gte = minAge;
        if (maxAge) filterCriteria.age.$lte = maxAge;
      }

      // Apply relationship goals filter if provided
      if (relationshipGoals) {
        filterCriteria.relationshipGoals = relationshipGoals;
      }

      // Apply physical activity filter if provided
      if (physicalActivity) {
        filterCriteria.physicalActivity = physicalActivity;
      }

      // Apply location filter if provided
      if (location) {
        filterCriteria.location = location;
      }

      // Apply interests filter if provided
      if (interests && interests.length > 0) {
        filterCriteria.interests = { $in: interests };
      }

      // Get filtered matches
      const filteredMatches = await Profile.find(filterCriteria)
        .populate("user", "username fullname")
        .select("-__v")
        .limit(20);

      // Calculate compatibility score for each match
      const matchesWithScore = filteredMatches.map(match => {
        const compatibilityScore = calculateCompatibilityScore(userProfile, match);
        return {
          ...match.toObject(),
          compatibilityScore
        };
      });

      // Sort by compatibility score
      const sortedMatches = matchesWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      res.json({
        success: true,
        count: sortedMatches.length,
        matches: sortedMatches
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

/**
 * Calculate compatibility score between two profiles
 * @param {Object} userProfile - Current user's profile
 * @param {Object} potentialMatch - Potential match profile
 * @returns {Number} - Compatibility score (0-100)
 */
function calculateCompatibilityScore(userProfile, potentialMatch) {
  let score = 0;
  let totalFactors = 0;
  
  // Common interests
  if (userProfile.interests && userProfile.interests.length > 0 && 
      potentialMatch.interests && potentialMatch.interests.length > 0) {
    
    const commonInterests = userProfile.interests.filter(interest => 
      potentialMatch.interests.includes(interest)
    );
    
    const interestScore = (commonInterests.length / 
      Math.max(userProfile.interests.length, potentialMatch.interests.length)) * 25;
    
    score += interestScore;
    totalFactors += 25;
  }
  
  // Location match
  if (userProfile.location && potentialMatch.location) {
    if (userProfile.location === potentialMatch.location) {
      score += 20;
    }
    totalFactors += 20;
  }
  
  // Relationship goals
  if (userProfile.relationshipGoals && potentialMatch.relationshipGoals) {
    if (userProfile.relationshipGoals === potentialMatch.relationshipGoals) {
      score += 20;
    }
    totalFactors += 20;
  }
  
  // Activity level compatibility
  if (userProfile.physicalActivity && potentialMatch.physicalActivity) {
    const activityLevels = ["Never", "Rarely", "Sometimes", "Often", "Very active"];
    const userActivityIndex = activityLevels.indexOf(userProfile.physicalActivity);
    const matchActivityIndex = activityLevels.indexOf(potentialMatch.physicalActivity);
    
    const activityDifference = Math.abs(userActivityIndex - matchActivityIndex);
    const activityScore = (1 - (activityDifference / 4)) * 10;
    
    score += activityScore;
    totalFactors += 10;
  }
  
  // Smoking compatibility
  if (userProfile.smoking && potentialMatch.smoking) {
    if (userProfile.smoking === potentialMatch.smoking) {
      score += 10;
    }
    totalFactors += 10;
  }
  
  // Drinking compatibility
  if (userProfile.drinking && potentialMatch.drinking) {
    if (userProfile.drinking === potentialMatch.drinking) {
      score += 10;
    }
    totalFactors += 10;
  }
  
  // Religion compatibility
  if (userProfile.religion && potentialMatch.religion) {
    if (userProfile.religion === potentialMatch.religion) {
      score += 5;
    }
    totalFactors += 5;
  }

  // Normalize score to 0-100 scale
  return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 50;
}

/**
 * Calculate diversity bonus to promote varied recommendations
 * @param {Object} userProfile - Current user's profile
 * @param {Object} potentialMatch - Potential match profile
 * @returns {Number} - Diversity bonus score
 */
function calculateDiversityBonus(userProfile, potentialMatch) {
  let diversityScore = 0;
  
  // Bonus for different occupation
  if (userProfile.occupation && potentialMatch.occupation && 
      userProfile.occupation !== potentialMatch.occupation) {
    diversityScore += 5;
  }
  
  // Bonus for different languages
  if (userProfile.languages && potentialMatch.languages) {
    const uniqueLanguages = potentialMatch.languages.filter(lang => 
      !userProfile.languages.includes(lang)
    );
    
    if (uniqueLanguages.length > 0) {
      diversityScore += 5;
    }
  }
  
  return diversityScore;
}

module.exports = matchController;