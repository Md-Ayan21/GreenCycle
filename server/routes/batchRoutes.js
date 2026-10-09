
const express = require("express");
const {
  getBatches,
  createBatch,
  getBatchById,
} = require("../controllers/batchController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All batch routes require authentication.
router.use(protect);

// List batches based on the logged-in user's role.
router.get(
  "/",
  allowRoles("admin", "shop", "collector", "recycler"),
  getBatches
);

// Create a batch from a completed pickup (admin only).
router.post(
  "/from-pickup/:pickupId",
  allowRoles("admin"),
  createBatch
);

// Get one batch by its MongoDB ID.
router.get(
  "/:id",
  allowRoles("admin", "shop", "collector", "recycler"),
  getBatchById
);

module.exports = router;
