import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    moduleName: string
  ): Promise<{ publicId: string; imageUrl: string }> {
    return new Promise((resolve, reject) => {
      try {
        // Lấy thời gian hiện tại
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Thêm '0' nếu cần

        // Tạo publicId theo cấu trúc "moduleName/year/month/userId_timestamp"
        const timestamp = now.getTime();
        const publicId = `myjob/${moduleName}/${year}/${month}/${userId}_${timestamp}`;


        const transformValue =
        moduleName === 'companyCover'
          ? [
            { aspect_ratio: '1024:360', crop: 'crop' },
            { width: 1024, height: 360, crop: 'limit' },
          ]
          : [
              { aspect_ratio: '1:1', crop: 'crop' },
              { width: 200, height: 200, crop: 'limit' },
            ]
         

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            transformation: transformValue
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              publicId: result.public_id, // Lưu publicId
              imageUrl: result.secure_url, // Trả về URL ảnh
            });
          }
        );

        // Đọc dữ liệu từ buffer và gửi tới Cloudinary
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * Hàm xóa file trên Cloudinary theo publicId
   */
  async deleteFile(publicId: string): Promise<void> {
    if (!publicId) {
      return; // Không làm gì nếu không có publicId
    }
    try {
        const result = await cloudinary.uploader.destroy(publicId,  { type: 'upload', resource_type: 'image' });
        if (result.result !== 'ok') {
          throw new Error(`Không thể xóa file trên Cloudinary: ${result.result}`);
        }
    } catch (error) {
      console.error('Lỗi khi xóa file trên Cloudinary:', error);
      throw new Error('Không thể xóa file trên Cloudinary');
    }
  }



}
