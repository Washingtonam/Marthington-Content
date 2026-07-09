import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ContentItem from './src/models/ContentItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const requestedPort = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get('/api/content', async (_req, res) => {
  try {
    const content = await ContentItem.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/content/refine', (req, res) => {
  try {
    const { content, instructions } = req.body || {};

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const instructionText = (instructions || 'Make this post more polished and concise.').trim();
    let refinedContent = content.trim();

    const lowerInstruction = instructionText.toLowerCase();

    if (lowerInstruction.includes('short') || lowerInstruction.includes('shorter')) {
      refinedContent = refinedContent
        .split('\n')
        .filter(Boolean)
        .slice(0, 6)
        .join('\n');
    }

    if (lowerInstruction.includes('emoji') || lowerInstruction.includes('emojis')) {
      refinedContent = refinedContent.replace(/([.!?])/g, '$1✨');
    }

    if (lowerInstruction.includes('professional')) {
      refinedContent = refinedContent.replace(/reach out today/i, 'connect with us today');
    }

    if (lowerInstruction.includes('urgent')) {
      refinedContent = refinedContent.replace(/take the next step/i, 'act now');
    }

    if (lowerInstruction.includes('story')) {
      refinedContent = `${refinedContent}\n\nThis is the kind of message that feels personal, relatable, and easy to trust.`;
    }

    return res.json({ refinedContent });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined. Please set it in your .env file.');
  process.exit(1);
}

const startServer = (port) => {
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    const server = startServer(requestedPort);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const fallbackPort = requestedPort + 1;
        console.warn(`Port ${requestedPort} is busy. Trying ${fallbackPort} instead.`);
        startServer(fallbackPort);
      } else {
        throw error;
      }
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
