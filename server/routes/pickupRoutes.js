
const express = require("express");
const {
  createPickup,
  getPickups,
  assignCollector,
  markPickedUp,
} = require("../controllers/pickupController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All pickup routes require authentication.
router.use(protect);

// Shop requests a pickup.
router.post(
  "/",
  allowRoles("shop"),
  createPickup
);

// View pickup requests.
router.get(
  "/",
  allowRoles("shop", "collector", "admin"),
  getPickups
);

// Admin assigns a collector.
router.patch(
  "/:id/assign",
  allowRoles("admin"),
  assignCollector
);

// Assigned collector confirms collection.
router.patch(
  "/:id/pickup",
  allowRoles("collector"),
  markPickedUp
);

module.exports = router;
