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
//Version 1.0
router.post("/v1/payment-option", requireSignin, authzMiddleware("admin"), create);

router.put("/v1/payment-option", requireSignin, authzMiddleware("admin"), update);
router.put(
  "/v1/payment-option/toggle-status",
  requireSignin,
  authzMiddleware("admin"),
  toggleStatus
);

router.get("/v1/payment-option", list);
router.get("/v1/payment-option/:slug", read);

router.delete("/v1/payment-option", requireSignin, authzMiddleware("admin"), remove);

export default router;