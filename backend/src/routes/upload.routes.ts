import { Router } from 'express';
import { uploadFile, uploadMultipleFiles } from '../controllers/upload.controller';
import { upload } from '../config/cloudinary.config';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// @route   POST /api/upload
// @desc    Upload a single file (Image, Video, or PDF)
// @access  Private (Requires authentication)
router.post('/', requireAuth, upload.single('file'), uploadFile);

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', requireAuth, upload.array('files', 10), uploadMultipleFiles);

export default router;
