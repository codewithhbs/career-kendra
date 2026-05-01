const router = require("express").Router();
const auth = require("../middlewares/auth");
const companyController = require("../controllers/companyController");
const createUploader = require("../middlewares/upload");

const upload = createUploader("companyDocuments");
router.post("/create-step1",auth, companyController.createCompanyStep1);
router.put("/update-step2", auth, upload.single('companyLogo'), companyController.updateCompanyStep2);
router.get("/profile", auth, companyController.getCompanyProfile);
router.put("/update", auth, companyController.updateCompany);
router.post("/submit", auth, companyController.submitCompanyForApproval);
router.delete("/delete", auth, companyController.deleteCompany);
router.get("/companies-list", auth, companyController.getAllCompaniesList);
router.get("/company/:id", auth, companyController.getCompanyById);
router.delete("/delete-company/:id", auth, companyController.deleteCompanyById);

module.exports = router;