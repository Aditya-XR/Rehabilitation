import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        cb(new ApiError(400, "Only image uploads are allowed"));
        return;
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
