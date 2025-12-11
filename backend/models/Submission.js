import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  flagProvided: { type: String, required: true }, // will be redacted in responses
  correct: { type: Boolean, required: true },
  pointsAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
SubmissionSchema.index({ teamId: 1, challengeId: 1, correct: 1 });

export default mongoose.model('Submission', SubmissionSchema);

