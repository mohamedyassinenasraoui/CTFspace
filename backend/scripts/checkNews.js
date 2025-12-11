import mongoose from 'mongoose';
import NewsArticle from '../models/NewsArticle.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkNews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf');
    console.log('Connected to MongoDB\n');

    const total = await NewsArticle.countDocuments();
    console.log(`Total articles in database: ${total}\n`);

    if (total > 0) {
      const latest = await NewsArticle.find()
        .sort({ publishedAt: -1 })
        .limit(5)
        .select('title source sourceName publishedAt category severity');

      console.log('Latest 5 articles:');
      latest.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.sourceName}`);
        console.log(`   Category: ${article.category}`);
        if (article.severity) console.log(`   Severity: ${article.severity}`);
        console.log(`   Published: ${article.publishedAt.toLocaleDateString()}`);
      });

      const byCategory = await NewsArticle.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      console.log('\n\nArticles by category:');
      byCategory.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count}`);
      });

      const bySource = await NewsArticle.aggregate([
        { $group: { _id: '$sourceName', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      console.log('\nArticles by source:');
      bySource.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count}`);
      });
    } else {
      console.log('No articles found. The news feed will populate on the next fetch.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkNews();

