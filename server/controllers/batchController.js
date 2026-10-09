
const Batch = require("../models/Batch");
const Pickup = require("../models/Pickup");
const EWaste = require("../models/EWaste");

const generateBatchId = require("../utils/generateBatchId");
const { recordBatchEvent } = require("../services/batchService");

// Get batches according to the user's role.
async function getBatches(req, res, next) {
  try {
    let filter = {};

    if (req.user.role === "shop") {
      filter.shop = req.user._id;
    } else if (req.user.role === "collector") {
      filter.collector = req.user._id;
    } else if (req.user.role === "recycler") {
      filter.$or = [
        { recycler: req.user._id },
        {
          status: "AT COLLECTION CENTER",
          recycler: null,
        },
      ];
    }

    const batches = await Batch.find(filter)
      .populate("shop", "name businessName")
      .populate("collector", "name")
      .populate("recycler", "name businessName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    next(error);
  }
}

// Admin creates a batch from a completed pickup.
async function createBatch(req, res, next) {
  try {
    const pickup = await Pickup.findById(req.params.pickupId);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    if (pickup.status !== "PICKED UP") {
      return res.status(409).json({
        success: false,
        message: "Only completed pickups can be batched",
      });
    }

    const existingBatch = await Batch.findOne({
      pickup: pickup._id,
    });

    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: "A batch already exists for this pickup",
        data: existingBatch,
      });
    }

    const ewaste = await EWaste.findById(pickup.ewaste);

    if (!ewaste) {
      return res.status(404).json({
        success: false,
        message: "Associated e-waste record not found",
      });
    }

    const batch = await Batch.create({
      batchId: await generateBatchId(),
      pickup: pickup._id,
      ewaste: ewaste._id,
      shop: pickup.shop,
      collector: pickup.collector,
      category: pickup.category,
      weight: pickup.actualWeight || pickup.weight,
      quantity: pickup.quantity,
      source: "Registered shop",
      status: "AT COLLECTION CENTER",
    });

    ewaste.status = "BATCHED";
    await ewaste.save();

    await recordBatchEvent({
      batch: batch._id,
      status: batch.status,
      message: "Batch created at collection center",
      actor: req.user._id,
      actorRole: req.user.role,
      weight: batch.weight,
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    next(error);
  }
}

// Get one batch by MongoDB document ID.
async function getBatchById(req, res, next) {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("shop", "name businessName")
      .populate("collector", "name")
      .populate("recycler", "name businessName");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (
      req.user.role === "shop" &&
      !batch.shop._id.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this batch",
      });
    }

    if (
      req.user.role === "collector" &&
      (!batch.collector ||
        !batch.collector._id.equals(req.user._id))
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this batch",
      });
    }

    if (
      req.user.role === "recycler" &&
      batch.recycler &&
      !batch.recycler._id.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "This batch belongs to another recycler",
      });
    }

    res.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBatches,
  createBatch,
  getBatchById,
};
