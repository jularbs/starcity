import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} from "./banner.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE } from "../auth/auth.constants.js";

router.post("/v1/banner",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  create
);

router.put("/v1/banner",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  update
);

router.put(
  "/v1/banner/toggle-status",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  toggleStatus
);

router.get("/v1/banner", list);

router.delete("/v1/banner",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  remove
);

export default router;