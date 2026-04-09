const express = require("express");
const router = express.Router();

const pageController = require("../controllers/page.controller");

router.post("/", pageController.createPage);

router.get("/", pageController.getAllPages);

router.get("/:id", pageController.getPageById);

router.get("/slug/:slug", pageController.getPageBySlug);

router.put("/:id", pageController.updatePage);

router.delete("/:id", pageController.deletePage);

module.exports = router;