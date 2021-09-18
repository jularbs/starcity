const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
} = require("../controllers/option");

//Version 1.0
router.post("/v1/option", create);
router.put("/v1/option", update);
router.get("/v1/option", list);
router.get("/v1/option/:slug", read);
router.delete("/v1/option", remove);

module.exports = router;
