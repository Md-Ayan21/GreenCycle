
const express = require("express");
const {
  getBatchPassport,
} = require("../controllers/passportController");

const router = express.Router();

// Public digital passport lookup by batch ID.
router.get("/:batchId", getBatchPassport);

module.exports = router;
