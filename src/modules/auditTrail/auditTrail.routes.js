import express from "express";
const router = express.Router();
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { list } from "./auditTrail.controller.js";
import { ADMIN_ROLE } from "../auth/auth.constants.js";

router.get("/v1/audit-trail",
    requireSignin,
    authzMiddleware(ADMIN_ROLE),
    list
);

export default router;