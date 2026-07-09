import mongoose from 'mongoose';

const affiliateLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const contentItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    vertical: {
      type: String,
      required: true,
      trim: true
    },
    contentBody: {
      type: String,
      required: true
    },
    affiliateLinks: [affiliateLinkSchema],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

export default mongoose.model('ContentItem', contentItemSchema);
