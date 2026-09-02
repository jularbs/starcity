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
//Version 1.0
router.post("/v1/promo", requireSignin, authzMiddleware("admin"), create);
router.post("/v1/promo/toggle", requireSignin, authzMiddleware("admin"), toggle);

router.patch("/v1/promo", requireSignin, authzMiddleware("admin"), update);

router.get("/v1/promo/apply", apply);
router.get("/v1/promo/:id", read);
router.get("/v1/promo", requireSignin, authzMiddleware("admin"), list);

router.delete("/v1/promo/:id", requireSignin, authzMiddleware("admin"), remove);



export default router;