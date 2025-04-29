import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

configDotenv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'findit_uploads', // optional: folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export {cloudinary, storage} ;
