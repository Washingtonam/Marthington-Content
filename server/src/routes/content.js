import express from 'express';
import {
  createContentItem,
  deleteContentItem,
  generateContentItem,
  getAllContentItems,
  getContentItemById,
  refineContentItem,
  updateContentItem
} from '../controllers/contentItemController.js';

const router = express.Router();

router.post('/generate', generateContentItem);
router.post('/refine', refineContentItem);
router.post('/', createContentItem);
router.get('/', getAllContentItems);
router.get('/:id', getContentItemById);
router.put('/:id', updateContentItem);
router.delete('/:id', deleteContentItem);

export default router;
