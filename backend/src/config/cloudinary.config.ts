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

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo'
];

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
    const isAllowedExt = Boolean(file.originalname && file.originalname.match(/\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|mp4|mov|avi)$/i));

    if (isAllowedMime || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed formats: Images, PDFs, Word Documents, and MP4/MOV videos.'));
    }
  }
});

export default cloudinary;

