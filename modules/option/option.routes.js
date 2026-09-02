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
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/option", requireSignin, authzMiddleware("admin"), create);
router.post("/v1/logo-option", requireSignin, authzMiddleware("admin"), logoUpload);

router.put("/v1/option", requireSignin, authzMiddleware("admin"), update);
router.get("/v1/option", list);
router.get("/v1/option/:name", read);
router.delete("/v1/option", requireSignin, authzMiddleware("admin"), remove);

export default router;