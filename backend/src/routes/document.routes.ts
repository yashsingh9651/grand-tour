import { Router } from 'express';
import { getDocuments, createDocument, updateStatus, deleteDocument } from '../controllers/document.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), getDocuments);
router.post('/', requireAuth, createDocument);
router.patch('/:id/status', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), updateStatus);
router.delete('/:id', requireAuth, deleteDocument);

export default router;
