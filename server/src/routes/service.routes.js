const express = require("express");
const router = express.Router();

const controller = require("../controllers/service.controller");
const createUploader = require("../middlewares/upload");

const upload = createUploader("services");


router.post(
    "/",
    upload.single("image"),
    controller.createService
);

router.get(
    "/",
    controller.getAllServices
);

router.get(
    "/:slug",
    controller.getServiceBySlug
);

router.put(
    "/:id",
    upload.single("image"),
    controller.updateService
);

router.delete(
    "/:id",
    controller.deleteService
);

router.post(
    "/reorder",
    controller.reorderServices
);

router.post(
    "/:id/comments",
    controller.addServiceComment
);
module.exports = router;