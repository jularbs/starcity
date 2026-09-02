import express from "express";
const router = express.Router();
import {
  create,
  list,
  update,
  remove,
  toggleStatus,
  read,
} from "./imageSlider.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/image-slider", requireSignin, authzMiddleware("admin"), create);

router.put("/v1/image-slider", requireSignin, authzMiddleware("admin"), update);
router.put(
  "/v1/image-slider/toggle-status",
  requireSignin,
  authzMiddleware("admin"),
  toggleStatus
);

router.get("/v1/image-slider", list);
router.get("/v1/image-slider/:slug", read);

router.delete("/v1/image-slider/:slug", requireSignin, authzMiddleware("admin"), remove);

export default router;