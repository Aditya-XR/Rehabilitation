import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPublicContent, getPublicContentByKey } from "../services/content.service.js";

export const listPublicContent = asyncHandler(async (req, res) => {
    const content = await getPublicContent(req.query);

    res.status(200).json(new ApiResponse(200, content, "Content fetched successfully"));
});

export const getContentByKey = asyncHandler(async (req, res) => {
    const content = await getPublicContentByKey(req.params.key);

    res.status(200).json(new ApiResponse(200, { content }, "Content fetched successfully"));
});
