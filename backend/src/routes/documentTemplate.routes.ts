import { Router } from 'express';
import documentTemplateController from '../controllers/documentTemplate.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'));

router.get('/', (req, res) => documentTemplateController.getAll(req, res));
router.get('/:id', (req, res) => documentTemplateController.getById(req, res));
router.post('/', (req, res) => documentTemplateController.create(req, res));
router.put('/:id', (req, res) => documentTemplateController.update(req, res));
router.delete('/:id', (req, res) => documentTemplateController.delete(req, res));

export default router;
