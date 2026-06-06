import { Router } from 'express';
import { getDocuments, createDocument, updateStatus, deleteDocument } from '../controllers/document.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getDocuments);
router.post('/', requireAuth, createDocument);
router.patch('/:id/status', requireAuth, updateStatus);
router.delete('/:id', requireAuth, deleteDocument);

export default router;
