import express from 'express';
import {
  addFacebookAccount,
  deleteFacebookAccount,
  listFacebookAccounts,
  updateFacebookAccount
} from '../controllers/contentItemController.js';

const router = express.Router();

router.post('/add', addFacebookAccount);
router.get('/', listFacebookAccounts);
router.put('/:id', updateFacebookAccount);
router.delete('/:id', deleteFacebookAccount);

export default router;
