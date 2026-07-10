import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ['facebook'],
      default: 'facebook'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    pageId: {
      type: String,
      required: true,
      trim: true
    },
    accessToken: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

export default mongoose.model('SocialAccount', socialAccountSchema);
