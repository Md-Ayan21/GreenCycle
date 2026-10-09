
const EWaste = require("../models/EWaste");
const Pickup = require("../models/Pickup");
const User = require("../models/User");

// Shop creates a pickup request.
async function createPickup(req, res, next) {
  try {
    const { ewasteId, address, scheduledDate, notes } = req.body;

    const ewaste = await EWaste.findById(ewasteId);

    if (!ewaste) {
      return res.status(404).json({
        success: false,
        message: "E-waste record not found",
      });
    }

    if (!ewaste.shop.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot request pickup for another shop",
      });
    }

    if (ewaste.status !== "REGISTERED") {
      return res.status(409).json({
        success: false,
        message: "This e-waste already has a pickup request or batch",
      });
    }

    const pickup = await Pickup.create({
      ewaste: ewaste._id,
      shop: req.user._id,
      category: ewaste.category,
      weight: ewaste.weight,
      quantity: ewaste.quantity,
      address: address.trim(),
      scheduledDate: scheduledDate || null,
      notes: notes || "",
    });

    ewaste.status = "PICKUP REQUESTED";
    await ewaste.save();

    res.status(201).json({
      success: true,
      message: "Pickup requested successfully",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
}

// Get pickups visible to the current role.
async function getPickups(req, res, next) {
  try {
    let filter = {};

    if (req.user.role === "shop") {
      filter.shop = req.user._id;
    } else if (req.user.role === "collector") {
      filter.collector = req.user._id;
    }

    const pickups = await Pickup.find(filter)
      .populate("shop", "name businessName")
      .populate("collector", "name")
      .populate("ewaste")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    next(error);
  }
}

// Admin assigns an active collector.
async function assignCollector(req, res, next) {
  try {
    const { collectorId } = req.body;

    if (
      typeof collectorId !== "string" ||
      !/^[a-f\d]{24}$/i.test(collectorId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid collector ID is required",
      });
    }

    const collector = await User.findOne({
      _id: collectorId,
      role: "collector",
      isActive: true,
    });

    if (!collector) {
      return res.status(404).json({
        success: false,
        message: "Active collector not found",
      });
    }

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    if (pickup.status !== "REQUESTED") {
      return res.status(409).json({
        success: false,
        message: "Only requested pickups can be assigned",
      });
    }

    pickup.collector = collector._id;
    pickup.status = "ASSIGNED";
    pickup.assignedAt = new Date();

    await pickup.save();

    res.json({
      success: true,
      message: "Collector assigned successfully",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
}

// Assigned collector marks the pickup as completed.
async function markPickedUp(req, res, next) {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    if (!pickup.collector || !pickup.collector.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "This pickup is not assigned to you",
      });
    }

    if (pickup.status !== "ASSIGNED") {
      return res.status(409).json({
        success: false,
        message: "Only assigned pickups can be marked picked up",
      });
    }

    const actualWeight =
      req.body.actualWeight === undefined
        ? pickup.weight
        : Number(req.body.actualWeight);

    if (!Number.isFinite(actualWeight) || actualWeight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Actual weight must be greater than zero",
      });
    }

    pickup.actualWeight = actualWeight;
    pickup.proofUrl = req.body.proofUrl || "";
    pickup.status = "PICKED UP";
    pickup.pickedUpAt = new Date();

    await pickup.save();

    await EWaste.findByIdAndUpdate(pickup.ewaste, {
      status: "PICKED UP",
      weight: actualWeight,
    });

    res.json({
      success: true,
      message: "Pickup marked as completed",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPickup,
  getPickups,
  assignCollector,
  markPickedUp,
};
