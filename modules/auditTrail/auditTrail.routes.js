import express from "express";
const router = express.Router();
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
import { list } from "./auditTrail.controller.js";

router.get("/v1/audit-trail", requireSignin, authMiddleware, list);

export default router;