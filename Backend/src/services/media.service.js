import { Readable } from "stream";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

const uploadBufferToCloudinary = (file, folder) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });

const normalizeUploadResult = (result) => ({
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    width: result.width,
    height: result.height,
    format: result.format,
});

export const uploadImage = async (file, folder) => {
    if (!file) {
        return null;
    }

    if (!isCloudinaryConfigured) {
        throw new ApiError(500, "Cloudinary is not configured");
    }

    const result = await uploadBufferToCloudinary(file, folder);
    return normalizeUploadResult(result);
};

export const uploadImages = async (files = [], folder) => {
    if (!files.length) {
        return [];
    }

    if (!isCloudinaryConfigured) {
        throw new ApiError(500, "Cloudinary is not configured");
    }

    const uploads = await Promise.all(files.map((file) => uploadBufferToCloudinary(file, folder)));
    return uploads.map(normalizeUploadResult);
};
