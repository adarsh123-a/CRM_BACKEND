const express = require("express");
const router = express.Router();
const leadCtrl = require("../controllers/leadController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(authenticate);

router.post("/", leadCtrl.createLead); // create
router.get("/", leadCtrl.getLeads); // list
router.get("/:id", leadCtrl.getLeadById); // single lead + history
router.patch("/:id", leadCtrl.updateLead); // update
router.delete("/:id", authorizeRoles("ADMIN", "MANAGER"), leadCtrl.deleteLead); // delete

module.exports = router;
