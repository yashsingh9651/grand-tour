import { Request, Response } from 'express';

// @desc    Upload a single file (Image, Video, or PDF)
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // req.file is populated by multer-storage-cloudinary
  const file = req.file as any;

  res.status(200).json({
    success: true,
    data: {
      url: file.path || file.secure_url,
      public_id: file.filename || file.public_id,
      format: file.format,
      resource_type: file.resource_type,
      original_name: file.originalname,
      size: file.size,
    }
  });
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleFiles = async (req: Request, res: Response) => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const files = (req.files as any[]).map(file => ({
    url: file.path || file.secure_url,
    public_id: file.filename || file.public_id,
    format: file.format,
    resource_type: file.resource_type,
    original_name: file.originalname,
    size: file.size,
  }));

  res.status(200).json({
    success: true,
    data: files
  });
};
