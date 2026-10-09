
const EWaste = require("../models/EWaste");

// Register new e-waste.
async function createEWaste(req, res, next) {
  try {
    const ewaste = await EWaste.create({
      shop: req.user._id,
      category: req.body.category.trim(),
      description: req.body.description || "",
      quantity: Number(req.body.quantity),
      weight: Number(req.body.weight),
    });

    res.status(201).json({
      success: true,
      message: "E-waste registered successfully",
      data: ewaste,
    });
  } catch (error) {
    next(error);
  }
}

// Get e-waste records.
async function getEWaste(req, res, next) {
  try {
    const filter =
      req.user.role === "shop"
        ? { shop: req.user._id }
        : {};

    const items = await EWaste.find(filter)
      .populate("shop", "name businessName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
}

// Get one e-waste record by MongoDB ID.
async function getEWasteById(req, res, next) {
  try {
    const item = await EWaste.findById(req.params.id)
      .populate("shop", "name businessName");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "E-waste record not found",
      });
    }

    if (
      req.user.role === "shop" &&
      !item.shop._id.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access another shop's e-waste",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEWaste,
  getEWaste,
  getEWasteById,
};
