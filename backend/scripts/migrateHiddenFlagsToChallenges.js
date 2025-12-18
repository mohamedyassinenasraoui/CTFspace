import mongoose from 'mongoose';
import HiddenFlag from '../models/HiddenFlag.js';
import Challenge from '../models/Challenge.js';
import FlagDiscovery from '../models/FlagDiscovery.js';
import Submission from '../models/Submission.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateHiddenFlagsToChallenges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf');
    console.log('Connected to MongoDB');

    const hiddenFlags = await HiddenFlag.find();
    console.log(`Found ${hiddenFlags.length} hidden flags to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const hiddenFlag of hiddenFlags) {
      // Check if challenge already exists (by title or flag)
      const existing = await Challenge.findOne({
        $or: [
          { title: hiddenFlag.title },
          { flag: hiddenFlag.flag }
        ]
      });

      if (existing) {
        console.log(`Skipping ${hiddenFlag.title} - already exists`);
        skipped++;
        continue;
      }

      // Convert category from hidden flag format to challenge format
      let category = hiddenFlag.category;
      // Map beginner/intermediate/advanced/expert to appropriate categories
      if (['beginner', 'intermediate', 'advanced', 'expert'].includes(category)) {
        // Keep the category as is, or map to web if it's a web-related tag
        if (hiddenFlag.tags && hiddenFlag.tags.includes('web')) {
          category = 'web';
        } else if (hiddenFlag.tags && hiddenFlag.tags.includes('crypto')) {
          category = 'crypto';
        } else if (hiddenFlag.tags && hiddenFlag.tags.includes('forensics')) {
          category = 'forensics';
        } else {
          category = 'misc'; // Default to misc
        }
      }

      // Convert hints from array of strings to array of objects
      const hints = hiddenFlag.hints.map(hint => ({
        text: hint,
        cost: 0
      }));

      // Create challenge from hidden flag
      const challenge = await Challenge.create({
        title: hiddenFlag.title,
        description: hiddenFlag.description || hiddenFlag.location,
        category: category,
        points: hiddenFlag.points || 10,
        difficulty: hiddenFlag.difficulty || 'easy',
        flag: hiddenFlag.flag, // Store plain flag for hidden challenges
        challengeType: 'hidden',
        visible: true, // Make hidden flags visible by default
        files: [],
        hints: hints,
        tags: hiddenFlag.tags || [],
        location: hiddenFlag.location,
        author: hiddenFlag.author || 'CTF Platform',
        likes: hiddenFlag.likes || 0,
        likedBy: hiddenFlag.likedBy || [],
        solvedCount: hiddenFlag.solvedCount || 0,
        createdAt: hiddenFlag.createdAt || new Date()
      });

      // Migrate flag discoveries to submissions
      const discoveries = await FlagDiscovery.find({ flagId: hiddenFlag.flagId });
      console.log(`  Migrating ${discoveries.length} discoveries for ${hiddenFlag.title}`);

      for (const discovery of discoveries) {
        // Check if submission already exists
        const existingSubmission = await Submission.findOne({
          userId: discovery.userId,
          challengeId: challenge._id,
          correct: true
        });

        if (!existingSubmission) {
          await Submission.create({
            userId: discovery.userId,
            teamId: discovery.teamId,
            challengeId: challenge._id,
            flagProvided: 'REDACTED',
            correct: true,
            pointsAwarded: discovery.pointsAwarded || challenge.points,
            createdAt: discovery.discoveredAt || new Date()
          });
        }
      }

      migrated++;
      console.log(`✓ Migrated: ${hiddenFlag.title}`);
    }

    console.log(`\nMigration complete!`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`\nNote: Hidden flags collection still exists. You can delete it after verifying the migration.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateHiddenFlagsToChallenges();









