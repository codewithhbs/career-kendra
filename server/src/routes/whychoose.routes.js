const express = require("express");
const router = express.Router();

const controller = require("../controllers/whyChooseUs.controller");

router.post("/", controller.createFeature);

router.get("/", controller.getAllFeatures);

router.put("/:id", controller.updateFeature);

router.delete("/:id", controller.deleteFeature);

router.post("/reorder", controller.repositionFeatures);

module.exports = router;