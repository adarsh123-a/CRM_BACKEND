const express = require("express");
const router = express.Router();
const companyCtrl = require("../controllers/companyController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Company routes
// Public route for creating companies
router.post("/", companyCtrl.createCompany); // Create company (no authentication required)

// Apply authentication middleware to all other routes
router.use(authenticate);

router.get("/", companyCtrl.getCompanies); // Get all companies
router.get("/:id", companyCtrl.getCompanyById); // Get company by ID
router.patch(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER"),
  companyCtrl.updateCompany
); // Update company (admin and manager)
router.delete("/:id", authorizeRoles("ADMIN"), companyCtrl.deleteCompany); // Delete company (admin only)

module.exports = router;
