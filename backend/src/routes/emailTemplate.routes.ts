import { Router } from 'express';
import emailTemplateController from '../controllers/emailTemplate.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';
const router = Router();

router.use(requireAuth);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/', emailTemplateController.getTemplates);
router.get('/:id', emailTemplateController.getTemplate);
router.put('/:id', emailTemplateController.updateTemplate);

export default router;
