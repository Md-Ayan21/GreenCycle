const User = require("../models/User");

// Get active collectors for admin assignment.
async function getCollectors(req, res, next) {
  try {
    const collectors = await User.find({
      role: "collector",
      isActive: true,
    })
      .select("name email")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: collectors.length,
      data: collectors,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCollectors,
};