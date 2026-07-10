import mongoose from 'mongoose';

const facebookAccountSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fbPageId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fbPageAccessToken: {
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

export default mongoose.model('FacebookAccount', facebookAccountSchema);
