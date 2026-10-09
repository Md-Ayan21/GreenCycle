
const Batch = require("../models/Batch");
const { recordBatchEvent } = require("../services/batchService");

// Recycler accepts a batch.
async function acceptBatch(req, res, next) {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (batch.status !== "AT COLLECTION CENTER") {
      return res.status(409).json({
        success: false,
        message: "This batch is not available for acceptance",
      });
    }

    batch.recycler = req.user._id;
    batch.status = "SENT TO RECYCLER";
    batch.acceptedAt = new Date();

    await batch.save();

    await recordBatchEvent({
      batch: batch._id,
      status: batch.status,
      message: "Batch accepted by recycler",
      actor: req.user._id,
      actorRole: req.user.role,
      weight: batch.weight,
    });

    res.json({
      success: true,
      message: "Batch accepted successfully",
      data: batch,
    });
  } catch (error) {
    next(error);
  }
}

// Recycler confirms recycling.
async function confirmRecycling(req, res, next) {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (
      !batch.recycler ||
      !batch.recycler.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "This batch is not assigned to your recycler account",
      });
    }

    if (batch.status !== "SENT TO RECYCLER") {
      return res.status(409).json({
        success: false,
        message: "Only sent batches can be confirmed as recycled",
      });
    }

    const certificateUrl = req.body.certificateUrl || "";

    if (
      typeof certificateUrl !== "string" ||
      certificateUrl.length > 2048
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate URL",
      });
    }

    batch.status = "RECYCLING CONFIRMED";
    batch.recycledAt = new Date();
    batch.certificateUrl = certificateUrl;

    await batch.save();

    await recordBatchEvent({
      batch: batch._id,
      status: batch.status,
      message: "Recycler confirmed recycling",
      actor: req.user._id,
      actorRole: req.user.role,
      weight: batch.weight,
      proofUrl: batch.certificateUrl,
    });

    res.json({
      success: true,
      message: "Recycling confirmed successfully",
      data: batch,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  acceptBatch,
  confirmRecycling,
};
