const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  logoUpload,
} = require("../controllers/option");

const { requireSignin, authMiddleware } = require("../controllers/auth");

//Version 1.0
router.post("/v1/option", requireSignin, authMiddleware, create);
router.post("/v1/logo-option", requireSignin, authMiddleware, logoUpload);

router.put("/v1/option", update);
router.get("/v1/option", list);
router.get("/v1/option/:name", read);
router.delete("/v1/option", remove);

module.exports = router;
