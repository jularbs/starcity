import express from "express";
const router = express.Router();
import { create, read, list, update, remove } from "./ride.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/ride", requireSignin, authzMiddleware("admin"), create);
router.put("/v1/ride", requireSignin, authzMiddleware("admin"), update);
router.get("/v1/ride", list);
router.get("/v1/ride/:slug", read);
router.delete("/v1/ride/:slug", requireSignin, authzMiddleware("admin"), remove);

export default router;