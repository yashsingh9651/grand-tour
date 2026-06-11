import { Router } from 'express';
import documentTemplateController from '../controllers/documentTemplate.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, (req, res) => documentTemplateController.getAll(req, res));
router.get('/:id', requireAuth, (req, res) => documentTemplateController.getById(req, res));
router.post('/', requireAuth, (req, res) => documentTemplateController.create(req, res));
router.put('/:id', requireAuth, (req, res) => documentTemplateController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => documentTemplateController.delete(req, res));

export default router;
