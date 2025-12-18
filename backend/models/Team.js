import mongoose from 'mongoose';
import crypto from 'crypto';

const TeamSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, trim: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  joinCode: { 
    type: String, 
    unique: true, 
    sparse: true,
    uppercase: true,
    trim: true
  }
});

// Generate join code before saving
TeamSchema.pre('save', async function(next) {
  if (this.isNew && !this.joinCode) {
    // Generate a 6-character alphanumeric code
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = crypto.randomBytes(3).toString('hex').toUpperCase();
      const existing = await mongoose.model('Team').findOne({ joinCode: code });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.joinCode = code;
  }
  
  // Validate max 5 members
  if (this.members.length > 5) {
    return next(new Error('Team cannot have more than 5 members'));
  }
  
  next();
});

export default mongoose.model('Team', TeamSchema);

