import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import ContentItem from './src/models/ContentItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const requestedPort = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

const gemini = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

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

app.post('/generate', async (req, res) => {
  try {
    const { service, tone, extraDetails } = req.body || {};

    if (!service || typeof service !== 'string') {
      return res.status(400).json({ message: 'Service is required.' });
    }

    if (!openai) {
      return res.status(500).json({ message: 'OPENAI_API_KEY is not configured.' });
    }

    const systemPrompt = 'You are an expert copywriter for Marthington Synergy Solutions. Your goal is to write high-converting local marketing copy. Always start with a compelling problem-first hook based on the service and context provided. Frame Marthington as a trusted guide providing frictionless, reliable access. End with a strong, clear Call-To-Action (CTA) instructing the user to reach out via WhatsApp or call.';
    const userPrompt = `Create a marketing post for the following service: ${service}. Tone: ${tone || 'Professional'}. Extra details/context: ${extraDetails || 'No extra context provided.'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.8,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const generatedText = completion.choices?.[0]?.message?.content?.trim() || '';

    if (!generatedText) {
      return res.status(500).json({ message: 'The AI response was empty.' });
    }

    const contentItem = await ContentItem.create({
      title: `Generated post for ${service}`,
      vertical: service,
      contentBody: generatedText,
      affiliateLinks: []
    });

    return res.status(200).json({
      message: 'Post generated successfully.',
      content: generatedText,
      savedId: contentItem._id
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post('/refine', async (req, res) => {
  try {
    const { originalPost, refinementInstructions } = req.body || {};

    if (!originalPost || typeof originalPost !== 'string') {
      return res.status(400).json({ message: 'originalPost is required.' });
    }

    if (!gemini) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured.' });
    }

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are an expert copywriter for Marthington Synergy Solutions. Your job is to rewrite or modify the user's provided marketing post based strictly on their instructions. Maintain local relevance, use engaging formatting, preserve any crucial links, and ensure a strong Call-To-Action.`,
        temperature: 0.7
      },
      contents: `Original Post:\n"${originalPost}"\n\nModification Instructions: Please ${refinementInstructions || 'make this post more polished and concise.'}`
    });

    const refinedText = response.text || originalPost.trim();

    return res.status(200).json({ refinedText });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to refine content with the Gemini engine.' });
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
