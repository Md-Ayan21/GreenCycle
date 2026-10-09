
function validateEWaste(req, res, next) {
  const { category, quantity, weight } = req.body;

  if (
    typeof category !== "string" ||
    !category.trim() ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 1 ||
    !Number.isFinite(Number(weight)) ||
    Number(weight) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Category, positive quantity, and positive weight are required",
    });
  }

  next();
}

module.exports = { validateEWaste };
