import { Router } from 'express';
import applicationPageContentController from '../controllers/applicationPageContent.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:pageKey', applicationPageContentController.getPageContent);
router.put('/:pageKey', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), applicationPageContentController.updatePageContent);

export default router;
