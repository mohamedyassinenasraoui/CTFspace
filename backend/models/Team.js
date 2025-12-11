import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, trim: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 }
});

// Validate max 5 members
TeamSchema.pre('save', function(next) {
  if (this.members.length > 5) {
    return next(new Error('Team cannot have more than 5 members'));
  }
  next();
});

export default mongoose.model('Team', TeamSchema);

