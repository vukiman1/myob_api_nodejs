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

  async deleteFile(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
  
  // Hàm helper để trích xuất `publicId` từ URL ảnh
  extractPublicIdFromUrl(imageUrl: string): string {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('.')[0]; // Lấy phần tên file trước đuôi mở rộng
    const folderPath = urlParts.slice(urlParts.indexOf('myjob')).join('/'); // Lấy đường dẫn từ thư mục gốc
    return folderPath.replace(fileName, fileName); // Public ID đầy đủ
  }
}

