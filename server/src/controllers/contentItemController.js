import ContentItem from '../models/ContentItem.js';

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
