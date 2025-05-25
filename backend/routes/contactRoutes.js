import express from 'express';
import {
  createContact,
  getContacts,
  deleteContact,
  updateContactToRead,
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(createContact)
  .get(protect, admin, getContacts);

router.route('/:id')
  .delete(protect, admin, deleteContact);

router.route('/:id/read')
  .put(protect, admin, updateContactToRead);

export default router;
