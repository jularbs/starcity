import express from "express";
const router = express.Router();
import { create, read, list, update, remove } from "./ride.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE } from "../auth/auth.constants.js";

router.post("/v1/ride",
    requireSignin,
    authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
    create
);

router.put("/v1/ride",
    requireSignin,
    authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
    update
);

router.get("/v1/ride", list);

router.get("/v1/ride/:slug", read);

router.delete("/v1/ride/:slug",
    requireSignin,
    authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
    remove
);

export default router;