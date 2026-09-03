import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
} from "./post.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE } from "../auth/auth.constants.js";
//Version 1.0
router.post("/v1/post",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE),
  create
);

router.put("/v1/post",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE),
  update
);

router.get("/v1/post", list);

router.get("/v1/post/:slug", read);

router.delete("/v1/post",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE),
  remove
);

export default router;