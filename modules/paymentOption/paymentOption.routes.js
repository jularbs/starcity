import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} from "./paymentOption.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from "../auth/auth.constants.js";

router.post("/v1/payment-option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  create);

router.put("/v1/payment-option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  update
);

router.put(
  "/v1/payment-option/toggle-status",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  toggleStatus
);

router.get("/v1/payment-option", list);
router.get("/v1/payment-option/:slug", read);

router.delete("/v1/payment-option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  remove
);

export default router;