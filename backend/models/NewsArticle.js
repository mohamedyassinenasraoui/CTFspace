import mongoose from 'mongoose';

const NewsArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  excerpt: { type: String },
  url: { type: String, required: true, unique: true },
  source: { type: String, required: true }, // e.g., 'nvd', 'rss', 'cybersecfeed'
  sourceName: { type: String, required: true }, // Display name of source
  author: { type: String },
  publishedAt: { type: Date, required: true },
  fetchedAt: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['news', 'vulnerability', 'threat', 'tutorial', 'analysis', 'alert'],
    default: 'news'
  },
  tags: [{ type: String }],
  cveIds: [{ type: String }], // CVE identifiers if applicable
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: null },
  imageUrl: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Store additional metadata
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
NewsArticleSchema.index({ publishedAt: -1 });
NewsArticleSchema.index({ category: 1, publishedAt: -1 });
NewsArticleSchema.index({ cveIds: 1 });
NewsArticleSchema.index({ url: 1 });

export default mongoose.model('NewsArticle', NewsArticleSchema);

