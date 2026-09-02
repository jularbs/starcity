import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  logoUpload,
} from "./option.controller.js";
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/option", requireSignin, authMiddleware, create);
router.post("/v1/logo-option", requireSignin, authMiddleware, logoUpload);

router.put("/v1/option", requireSignin, authMiddleware, update);
router.get("/v1/option", list);
router.get("/v1/option/:name", read);
router.delete("/v1/option", requireSignin, authMiddleware, remove);

export default router;