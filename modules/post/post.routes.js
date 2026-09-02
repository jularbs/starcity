import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
} from "./post.controller.js";
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/post", requireSignin, authMiddleware, create);
router.put("/v1/post", requireSignin, authMiddleware, update);
router.get("/v1/post", list);
router.get("/v1/post/:slug", read);
router.delete("/v1/post", requireSignin, authMiddleware, remove);

export default router;