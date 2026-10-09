
const Batch = require("../models/Batch");
const BatchEvent = require("../models/BatchEvent");

async function getPassport(batchId) {
  const batch = await Batch.findOne({ batchId })
    .populate("shop", "name businessName")
    .populate("collector", "name")
    .populate("recycler", "name businessName");

  if (!batch) {
    return null;
  }

  const events = await BatchEvent.find({
    batch: batch._id,
  })
    .populate("actor", "name role")
    .sort({ occurredAt: 1 });

  return {
    batch,
    events,
  };
}

module.exports = {
  getPassport,
};
