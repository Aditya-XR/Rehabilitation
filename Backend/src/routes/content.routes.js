import { Router } from "express";
import { getContentByKey, listPublicContent } from "../controllers/content.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { validatePublicContentQuery } from "../validations/content.validation.js";

const router = Router();

router.get("/", validateRequest({ query: validatePublicContentQuery }), listPublicContent);
router.get("/:key", getContentByKey);

export default router;
