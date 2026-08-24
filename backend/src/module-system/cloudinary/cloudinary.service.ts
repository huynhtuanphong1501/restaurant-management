import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService{
    async upload(file: Express.Multer.File, folder: string) {
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader.upload_stream({folder: folder},(error, uploadResult) => {
                if (error) {
                    return reject(error);
                }
                if (!uploadResult) {
                return reject( new Error('Cloudinary upload failed'));
              }
                return resolve(uploadResult);
            }).end(file.buffer);
        });
        return uploadResult;
    }
    async delete(publicId: string) {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    }
}