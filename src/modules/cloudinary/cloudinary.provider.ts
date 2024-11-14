import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
        cloud_name: 'myjob',
        api_key: '761938933492173',
        api_secret:  'T3Ra9YH_yhLWD6sp9pEwK0r37cM'
    });
  },
};
