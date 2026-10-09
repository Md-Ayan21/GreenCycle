const express = require("express");
const { getCollectors } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.get("/collectors", allowRoles("admin"), getCollectors);

module.exports = router;