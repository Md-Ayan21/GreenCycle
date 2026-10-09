
function validatePickup(req, res, next) {
  const { ewasteId, address } = req.body;

  if (
    typeof ewasteId !== "string" ||
    !/^[a-f\d]{24}$/i.test(ewasteId) ||
    typeof address !== "string" ||
    !address.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "A valid e-waste ID and pickup address are required",
    });
  }

  next();
}

module.exports = { validatePickup };
