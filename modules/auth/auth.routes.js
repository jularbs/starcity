import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  signout,
  changePassword,
  requireSignin,
  authMiddleware,
  validateToken,
} from "./auth.controller.js";
import { createRateLimiter } from "../../helpers/rateLimiter.js";

router.post("/v1/signup",
  createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 60 minutes." }),
  signup);
router.post("/v1/signin",
  createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 15 minutes." }),
  signin);
router.post(
  "/v1/change-password",
  requireSignin,
  authMiddleware,
  changePassword
);

router.get("/v1/signout", signout);

router.get("/v1/validate-token", requireSignin, authMiddleware, validateToken);

export default router;