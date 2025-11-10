const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Apply authentication middleware to all routes
router.use(authenticate);

// User routes
router.patch(
  "/assign",
  authorizeRoles("ADMIN", "MANAGER"),
  userCtrl.assignUserToCompany
); // Assign user to company
router.get("/company/:companyId", userCtrl.getUsersByCompany); // Get users by company ID
router.put("/:userId", authorizeRoles("ADMIN", "MANAGER"), userCtrl.updateUser); // Update user

module.exports = router;
