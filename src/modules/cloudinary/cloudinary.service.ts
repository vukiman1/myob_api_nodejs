import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File, 
    userId: number, 
    moduleName: string
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const timestamp = new Date().getTime(); 
        const publicId = `myjob/${moduleName}/${userId}_${timestamp}`;; // Đặt tên ảnh theo `moduleName` và `userId`

        // Xóa ảnh cũ nếu đã tồn tại
        await cloudinary.uploader.destroy(publicId, { invalidate: true });

        // Khởi tạo stream upload với cấu hình resize và public_id
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            transformation: [{ width: 200, height: 200, crop: "limit" }], // Resize ảnh
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url); // Trả về đường link ảnh
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    });
  }
}
