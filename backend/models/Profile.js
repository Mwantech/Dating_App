const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    birthdate: {
        type: Date
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"]
    },
    interestedIn: {
        type: [String],
        enum: ["Male", "Female", "Non-binary", "Other"]
    },
    location: {
        type: String
    },
    occupation: {
        type: String
    },
    interests: {
        type: [String]
    },
    photos: {
        type: [String], // Array of photo URLs
        validate: [arrayLimit, "You can only upload up to 6 photos"]
    },
    relationshipGoals: {
        type: String,
        enum: ["Casual", "Dating", "Serious", "Marriage", "Not sure yet"]
    },
    height: {
        type: Number // in cm
    },
    physicalActivity: {
        type: String,
        enum: ["Never", "Rarely", "Sometimes", "Often", "Very active"]
    },
    smoking: {
        type: String,
        enum: ["Never", "Occasionally", "Regularly", "Trying to quit"]
    },
    drinking: {
        type: String,
        enum: ["Never", "Socially", "Regularly"]
    },
    religion: {
        type: String
    },
    languages: {
        type: [String]
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Validation function to limit the number of photos
function arrayLimit(val) {
    return val.length <= 6;
}

// Virtual for profile completion percentage
ProfileSchema.virtual('completionPercentage').get(function() {
    const totalFields = 13; // Count of important profile fields
    let completedFields = 0;
    
    if (this.bio && this.bio.length > 0) completedFields++;
    if (this.birthdate) completedFields++;
    if (this.gender) completedFields++;
    if (this.interestedIn && this.interestedIn.length > 0) completedFields++;
    if (this.location) completedFields++;
    if (this.occupation) completedFields++;
    if (this.interests && this.interests.length > 0) completedFields++;
    if (this.photos && this.photos.length > 0) completedFields++;
    if (this.relationshipGoals) completedFields++;
    if (this.height) completedFields++;
    if (this.physicalActivity) completedFields++;
    if (this.smoking) completedFields++;
    if (this.drinking) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
});

// Pre-save middleware to check if profile is complete
ProfileSchema.pre('save', function(next) {
    const completionThreshold = 70; // 70% completion to be considered "complete"
    this.isProfileComplete = this.completionPercentage >= completionThreshold;
    next();
});

module.exports = mongoose.model("Profile", ProfileSchema);