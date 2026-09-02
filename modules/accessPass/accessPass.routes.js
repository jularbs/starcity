import express from "express";
const router = express.Router();
import { download } from "./accessPass.controller.js";

//Version 1.0
router.get("/v1/download/:salt/:refId/:ticketId", download);

export default router;
