import mongoose from 'mongoose';

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    // Support both old categories (web, crypto, etc.) and new categories (beginner, intermediate, etc.)
  },
  points: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  
  // Flag storage - can use either hashed (for regular challenges) or plain (for hidden flags)
  flagHash: { type: String }, // salted hash of the correct flag (optional for hidden flags)
  flagSalt: { type: String }, // salt used for hashing (optional for hidden flags)
  flag: { type: String }, // Plain flag for hidden flag challenges (optional)
  
  // Challenge type
  challengeType: { 
    type: String, 
    enum: ['regular', 'hidden'], 
    default: 'regular' 
  }, // 'regular' uses flagHash, 'hidden' uses plain flag
  
  visible: { type: Boolean, default: false },
  files: [{ type: String }], // URLs or paths to challenge files
  
  // Hints - support both formats
  hints: [{
    text: String,
    cost: { type: Number, default: 0 } // points cost for viewing hint
  }],
  
  // Additional fields from hidden flags
  tags: [{ type: String }], // e.g., ['web', 'forensics', 'recon']
  location: { type: String }, // Where to find it (for hidden flags)
  author: { type: String, default: 'CTF Platform' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: { type: Date, default: Date.now },
  solvedCount: { type: Number, default: 0 } // number of teams that solved it
});

// Validation: ensure either flagHash or flag is present
ChallengeSchema.pre('validate', function(next) {
  if (this.challengeType === 'hidden') {
    if (!this.flag) {
      return next(new Error('Hidden flag challenges require a plain flag'));
    }
  } else {
    if (!this.flagHash || !this.flagSalt) {
      return next(new Error('Regular challenges require flagHash and flagSalt'));
    }
  }
  next();
});

export default mongoose.model('Challenge', ChallengeSchema);

