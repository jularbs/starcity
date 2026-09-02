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
//Version 1.0
router.post("/v1/ticket", requireSignin, authzMiddleware("admin"), create);
router.put("/v1/ticket", requireSignin, authzMiddleware("admin"), update);
router.get("/v1/ticket", list);
router.get("/v1/ticket/:slug", read);
router.delete("/v1/ticket", requireSignin, authzMiddleware("admin"), remove);

router.put(
  "/v1/ticket/toggle-status",
  requireSignin,
  authzMiddleware("admin"),
  toggleStatus
);

export default router;