import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true }, // Removed unique constraint
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  passwordHash: { type: String }, // Made optional for OAuth users
  authProvider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
  providerId: { type: String }, // Google/Apple user ID
  avatar: { type: String }, // Profile picture URL
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ providerId: 1, authProvider: 1 });

export default mongoose.model('User', UserSchema);

