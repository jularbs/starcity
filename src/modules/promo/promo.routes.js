import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  apply,
  toggle
} from "./promo.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from "../auth/auth.constants.js";
//Version 1.0
router.post("/v1/promo",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  create
);

router.post("/v1/promo/toggle",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  toggle
);

router.patch("/v1/promo",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  update
);

router.get("/v1/promo/apply", apply);

router.get("/v1/promo/:id", read);

router.get("/v1/promo", requireSignin, authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE), list);

router.delete("/v1/promo/:id",
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  remove
);



export default router;