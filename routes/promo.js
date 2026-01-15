const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  apply,
  toggle
} = require("../controllers/promo");

const { requireSignin, authMiddleware } = require("../controllers/auth");

//Version 1.0
router.post("/v1/promo", requireSignin, authMiddleware, create);
router.post("/v1/promo/toggle", requireSignin, authMiddleware, toggle);

router.patch("/v1/promo", requireSignin, authMiddleware, update);

router.get("/v1/promo/apply", apply);
router.get("/v1/promo/:id", read);
router.get("/v1/promo", requireSignin, authMiddleware, list);

router.delete("/v1/promo/:id", requireSignin, authMiddleware, remove);



module.exports = router;
