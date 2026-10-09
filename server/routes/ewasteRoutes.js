
const express = require("express");
const {
  createEWaste,
  getEWaste,
  getEWasteById,
} = require("../controllers/ewasteController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All e-waste routes require authentication.
router.use(protect);

// Register e-waste (shops only).
router.post(
  "/",
  allowRoles("shop"),
  createEWaste
);

// View e-waste records.
router.get(
  "/",
  allowRoles("shop", "admin", "collector", "recycler"),
  getEWaste
);

// View one e-waste record.
router.get(
  "/:id",
  allowRoles("shop", "admin", "collector", "recycler"),
  getEWasteById
);

module.exports = router;
