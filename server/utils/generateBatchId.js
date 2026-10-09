
const Batch = require("../models/Batch");

async function generateBatchId() {
  const year = new Date().getFullYear();

  // Generate a unique ID for the current year.
  for (let attempt = 0; attempt < 10; attempt++) {
    const count = await Batch.countDocuments({
      batchId: { $regex: `^EW-${year}-` },
    });

    const batchId = `EW-${year}-${String(
      count + attempt + 1
    ).padStart(5, "0")}`;

    const exists = await Batch.exists({ batchId });

    if (!exists) {
      return batchId;
    }
  }

  throw new Error("Could not generate a unique batch ID");
}

module.exports = generateBatchId;
