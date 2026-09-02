import express from "express";
const router = express.Router();
import {
    requireSignin,
    authMiddleware,
} from "../../common/middleware/auth.middleware.js";
import { remove, read, list, update } from "./user.controller.js";

router.delete("/v1/user/:id", requireSignin, authMiddleware, remove);
router.get("/v1/user/:id", requireSignin, authMiddleware, read);
router.get("/v1/user", requireSignin, authMiddleware, list);
router.patch("/v1/user", requireSignin, authMiddleware, update);

export default router;
