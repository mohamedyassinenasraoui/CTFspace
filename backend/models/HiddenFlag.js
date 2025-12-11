import mongoose from 'mongoose';

const HiddenFlagSchema = new mongoose.Schema({
  flagId: { type: String, unique: true, required: true }, // e.g., 'html-comment-1'
  flag: { type: String, required: true }, // The actual flag
  title: { type: String, required: true }, // Challenge title
  category: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  tags: [{ type: String }], // e.g., ['web', 'forensics', 'recon']
  location: { type: String, required: true }, // Where to find it
  description: { type: String, required: true }, // Full description
  hints: [{ type: String }], // Array of hints
  author: { type: String, default: 'CTF Platform' },
  solvedCount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  points: { type: Number, default: 10 }, // Points awarded
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('HiddenFlag', HiddenFlagSchema);

