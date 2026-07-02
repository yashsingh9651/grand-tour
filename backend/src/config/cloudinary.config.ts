import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    const isPDF = file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf');
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    const resourceType = (isPDF || isImage) ? 'image' : 
                         isVideo ? 'video' : 'raw';
    
    const hasDot = file.originalname.includes('.');
    const ext = hasDot ? file.originalname.split('.').pop() : '';
    const nameWithoutExt = hasDot 
      ? file.originalname.substring(0, file.originalname.lastIndexOf('.'))
      : file.originalname;
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    const publicId = resourceType === 'raw' && ext 
      ? `${Date.now()}-${safeName}.${ext}` 
      : `${Date.now()}-${safeName}`;
    
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                || file.originalname.endsWith('.docx')
                || file.originalname.endsWith('.doc');

    const params: any = {
      folder: 'grand-tour/uploads',
      resource_type: resourceType,
      public_id: publicId,
    };

    // Only restrict formats for image uploads; raw (docx, xlsx, etc.) pass through unrestricted
    if (resourceType === 'image' && !isDocx) {
      params.allowed_formats = ['jpg', 'png', 'jpeg', 'pdf'];
    }

    return params;
  },
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export default cloudinary;
