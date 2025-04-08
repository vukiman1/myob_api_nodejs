import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    moduleName: string
  ): Promise<{ publicId: string; imageUrl: string }> {
    return new Promise((resolve, reject) => {
      try {
        const publicId = this.createPublicUrl(moduleName, fileName).toString();
        const transformValue = this.transformValue(moduleName)
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            transformation: transformValue,
            resource_type: 'auto'
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
  // async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
  //   if (!publicId) {
  //     return; // Không làm gì nếu không có publicId
  //   }
  //   try {
  //       const result = await cloudinary.uploader.destroy(publicId,  { type: 'upload', resource_type: resourceType, });
  //       if (result.result !== 'ok') {
  //         throw new Error(`Không thể xóa file trên Cloudinary: ${result.result}`);
  //       }
  //   } catch (error) {
  //     console.error('Lỗi khi xóa file trên Cloudinary:', error);
  //     throw new Error('Không thể xóa file trên Cloudinary');
  //   }
  // }

  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    if (!publicId) {
      return; // Không làm gì nếu không có publicId
    }

    const result = await cloudinary.uploader.destroy(publicId,  { type: 'upload', resource_type: resourceType, });
    return result
  }

  transformValue(moduleName: string) {
    const value = moduleName === 'companyCover'
    ? [
        { aspect_ratio: '1024:360', crop: 'crop' },
        { width: 1024, height: 360, crop: 'limit' },
      ]
    : moduleName === 'companyImageUrl' || 'avatarUrl'
    ? [
        { aspect_ratio: '1:1', crop: 'crop' },
        { width: 150, height: 150, crop: 'limit' },
      ]
    : []; 
    return value
  }

  createPublicUrl(moduleName: string, fileName: string) {
    const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Thêm '0' nếu cần
        // Tạo publicId theo cấu trúc "moduleName/year/month/userId_timestamp"
        const timestamp = now.getTime();
        const publicId = `myjob/${moduleName}/${year}/${month}/${fileName}_${timestamp}`;
        return publicId;
    }

    async uploadPdfWithImage(
      file: Express.Multer.File,
      fileName: string,
      moduleName: string = 'jobSeekerCv',
    ): Promise<{ pdfUrl: string; publicId: string; imageUrl: string }> {
      // Upload PDF
      const pdfUpload = await this.uploadFile(file, fileName, moduleName);
    

      // Tạo URL của hình ảnh từ các trang PDF
      const imageUrl = cloudinary.url(pdfUpload.publicId, {
        resource_type: 'image', // Định nghĩa resource_type là image để lấy trang từ PDF
        type: 'upload',         // Loại upload
        format: 'jpg',          // Chuyển đổi sang JPG
        page: 2,            // Lấy các trang từ 1 -> 5
      }
      )
      
      console.log(imageUrl);
      return {
        pdfUrl: pdfUpload.imageUrl, // URL của PDF
        publicId: pdfUpload.publicId, // Public ID của file PDF
        imageUrl: imageUrl, // Danh sách URL của các trang PDF
      };
    }
    

    async uploadBanner(file: Express.Multer.File, fileName: string, moduleName: string = 'banner') {
      return new Promise((resolve, reject) => {
        try {
          const publicId = this.createPublicUrl(moduleName, fileName).toString();
          const transformValue = [
            { fetch_format: "auto" } // Chuyển đổi định dạng để giảm dung lượng
          ];
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              transformation: transformValue,
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) return reject(error);
  
              resolve({
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

    async uploadCompanyImage(
      file: Express.Multer.File,
      fileName: string,
      moduleName: string
    ): Promise<{ publicId: string; imageUrl: string }> {
      return new Promise((resolve, reject) => {
        try {
          const publicId = this.createPublicUrl(moduleName, fileName).toString();
          const transformValue = [
            { quality: "auto:low" }, // Giảm chất lượng tự động để tối ưu dung lượng
            { fetch_format: "auto" } // Chuyển đổi định dạng để giảm dung lượng
          ];
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              transformation: transformValue, // Áp dụng transformation
              resource_type: 'auto'
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


    async uploadPageBanner(
      file: Express.Multer.File,
      fileName: string,
      moduleName: string
    ): Promise<{ publicId: string; imageUrl: string }> {
      return new Promise((resolve, reject) => {
        try {
          const publicId = this.createPublicUrl(moduleName, fileName).toString();
          const transformValue = [
            { quality: "auto:low" }, // Giảm chất lượng tự động để tối ưu dung lượng
            { fetch_format: "auto" } // Chuyển đổi định dạng để giảm dung lượng
          ];
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              transformation: transformValue, // Áp dụng transformation
              resource_type: 'auto'
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


    async uploadPageBanner2(
      file: Express.Multer.File,
      fileName: string,
      moduleName: string
    ): Promise<{ publicId: string; secure_url: string }> {
      return new Promise((resolve, reject) => {
        try {
          const publicId = this.createPublicUrl(moduleName, fileName).toString();
          const transformValue = [
            { quality: "auto:low" }, // Giảm chất lượng tự động để tối ưu dung lượng
            { fetch_format: "auto" } // Chuyển đổi định dạng để giảm dung lượng
          ];
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              transformation: transformValue, // Áp dụng transformation
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) return reject(error);
  
              resolve({
                publicId: result.public_id, // Lưu publicId
                secure_url: result.secure_url, // Trả về URL ảnh
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

}
