import express from "express";
const router = express.Router();
import {
  create,
  read,
  update,
  list,
  remove,
  toggleStatus,
} from "./ticket.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from "../auth/auth.constants.js";

router.post("/v1/ticket",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  create
);

router.put("/v1/ticket",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  update
);

router.get("/v1/ticket", list);

router.get("/v1/ticket/:slug", read);

router.delete("/v1/ticket",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  remove
);

router.put(
  "/v1/ticket/toggle-status",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  toggleStatus
);

export default router;