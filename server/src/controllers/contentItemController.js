import { GoogleGenAI } from '@google/genai';
import ContentItem from '../models/ContentItem.js';

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export const generateContentItem = async (req, res) => {
  try {
    const { service, vertical, tone, extraDetails } = req.body || {};
    const selectedService = typeof service === 'string' && service.trim()
      ? service.trim()
      : typeof vertical === 'string' && vertical.trim()
        ? vertical.trim()
        : '';

    if (!selectedService) {
      return res.status(400).json({ message: 'Service or vertical is required.' });
    }

    if (!gemini) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured.' });
    }

    const systemInstruction = 'You are an expert copywriter for Marthington Synergy Solutions. Write high-converting local marketing copy. Start with a compelling problem-first hook based on the service and context provided. Frame Marthington as a trusted guide providing frictionless, reliable access. End with a strong, clear Call-To-Action (CTA) instructing the user to reach out via WhatsApp or call.';
    const userPrompt = `Create a marketing post for the following service: ${selectedService}. Tone: ${tone || 'Professional'}. Extra details/context: ${extraDetails || 'No extra context provided.'}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        temperature: 0.8
      },
      contents: userPrompt
    });

    const generatedText = response?.text?.trim() || '';

    if (!generatedText) {
      return res.status(500).json({ message: 'The AI response was empty.' });
    }

    const affiliateLinks = Array.from(
      new Set((extraDetails || '').match(/https?:\/\/[^\s]+/g) || [])
    ).map((url) => ({ label: 'Reference link', url }));

    const contentItem = await ContentItem.create({
      title: `Generated post for ${selectedService}`,
      vertical: selectedService,
      contentBody: generatedText,
      affiliateLinks
    });

    return res.status(200).json({
      message: 'Post generated successfully.',
      content: generatedText,
      contentItem,
      savedId: contentItem._id
    });
  } catch (error) {
    console.error('Gemini generation failed:', error);
    return res.status(500).json({
      message: 'Failed to generate content with the Gemini engine.',
      details: error?.message || 'Unknown error'
    });
  }
};

export const refineContentItem = async (req, res) => {
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
        systemInstruction: 'You are an expert copywriter for Marthington Synergy Solutions. Your job is to rewrite or modify the user\'s provided marketing post based strictly on their instructions. Maintain local relevance, use engaging formatting, preserve any crucial links, and ensure a strong Call-To-Action.',
        temperature: 0.7
      },
      contents: `Original Post:\n"${originalPost}"\n\nModification Instructions: Please ${refinementInstructions || 'make this post more polished and concise.'}`
    });

    const refinedText = response?.text?.trim() || originalPost.trim();

    return res.status(200).json({ refinedText });
  } catch (error) {
    console.error('Gemini refinement failed:', error);
    return res.status(500).json({
      message: 'Failed to refine content with the Gemini engine.',
      details: error?.message || 'Unknown error'
    });
  }
};

export const createContentItem = async (req, res) => {
  try {
    const contentItem = new ContentItem(req.body);
    const savedItem = await contentItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllContentItems = async (_req, res) => {
  try {
    const items = await ContentItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContentItemById = async (req, res) => {
  try {
    const item = await ContentItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content item not found' });
    }
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateContentItem = async (req, res) => {
  try {
    const updatedItem = await ContentItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedItem) {
      return res.status(404).json({ message: 'Content item not found' });
    }

    return res.json(updatedItem);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteContentItem = async (req, res) => {
  try {
    const deletedItem = await ContentItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Content item not found' });
    }

    return res.json({ message: 'Content item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
