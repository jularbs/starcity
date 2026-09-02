import express from "express";
const router = express.Router();
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { list } from "./auditTrail.controller.js";

router.get("/v1/audit-trail", requireSignin, authzMiddleware("admin"), list);

export default router;