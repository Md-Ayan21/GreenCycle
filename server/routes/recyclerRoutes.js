
const express = require("express");
const {
  acceptBatch,
  confirmRecycling,
} = require("../controllers/recyclerController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Only authenticated recyclers can access these routes.
router.use(protect);
router.use(allowRoles("recycler"));

// Recycler accepts an available batch.
router.patch("/:id/accept", acceptBatch);

// Recycler confirms that recycling is complete.
router.patch("/:id/confirm", confirmRecycling);

module.exports = router;
