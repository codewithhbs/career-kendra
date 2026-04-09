const express = require("express");
const router = express.Router();

const controller = require("../controllers/organizationLogo.controller");
const createUploader = require("../middlewares/upload");

const upload = createUploader("organizationlogo");


router.post(
  "/",
  upload.single("image"),
  controller.createOrganizationLogo
);

router.get(
  "/",
  controller.getAllOrganizationLogos
);

router.put(
  "/:id",
  upload.single("image"),
  controller.updateOrganizationLogo
);

router.delete(
  "/:id",
  controller.deleteOrganizationLogo
);

router.post(
  "/reorder",
  controller.reorderOrganizationLogos
);

module.exports = router;