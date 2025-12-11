import mongoose from 'mongoose';

const FlagDiscoverySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  flagId: { type: String, required: true },
  discoveredAt: { type: Date, default: Date.now },
  pointsAwarded: { type: Number, default: 0 }
});

// Prevent duplicate discoveries
FlagDiscoverySchema.index({ userId: 1, flagId: 1 }, { unique: true });

export default mongoose.model('FlagDiscovery', FlagDiscoverySchema);

