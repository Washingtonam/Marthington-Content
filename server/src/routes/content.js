import express from 'express';
import {
  createContentItem,
  deleteContentItem,
  getAllContentItems,
  getContentItemById,
  updateContentItem
} from '../controllers/contentItemController.js';

const router = express.Router();

router.post('/', createContentItem);
router.get('/', getAllContentItems);
router.get('/:id', getContentItemById);
router.put('/:id', updateContentItem);
router.delete('/:id', deleteContentItem);

export default router;
