import express from 'express';
import {
  createContentItem,
  createSocialAccount,
  deleteContentItem,
  deleteSocialAccount,
  generateContentItem,
  getAllContentItems,
  getContentItemById,
  listSocialAccounts,
  publishToFacebook,
  refineContentItem,
  updateContentItem,
  updateSocialAccount
} from '../controllers/contentItemController.js';

const router = express.Router();

router.post('/generate', generateContentItem);
router.post('/refine', refineContentItem);
router.post('/facebook/publish', publishToFacebook);
router.get('/social-accounts', listSocialAccounts);
router.post('/social-accounts', createSocialAccount);
router.put('/social-accounts/:id', updateSocialAccount);
router.delete('/social-accounts/:id', deleteSocialAccount);
router.post('/', createContentItem);
router.get('/', getAllContentItems);
router.get('/:id', getContentItemById);
router.put('/:id', updateContentItem);
router.delete('/:id', deleteContentItem);

export default router;
