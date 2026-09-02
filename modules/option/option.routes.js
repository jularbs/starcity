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
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE } from "../auth/auth.constants.js";

router.post("/v1/option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  create
);

router.post("/v1/logo-option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  logoUpload
);

router.put("/v1/option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  update
);

router.get("/v1/option", list);

router.get("/v1/option/:name", read);

router.delete("/v1/option",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  remove
);

export default router;