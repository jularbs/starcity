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
//Version 1.0
router.post("/v1/banner", requireSignin, authzMiddleware("admin"), create);

router.put("/v1/banner", requireSignin, authzMiddleware("admin"), update);
router.put(
  "/v1/banner/toggle-status",
  requireSignin,
  authzMiddleware("admin"),
  toggleStatus
);

router.get("/v1/banner", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/banner", requireSignin, authzMiddleware("admin"), remove);

export default router;