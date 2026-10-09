
const { getPassport } = require("../services/passportService");

// Public digital passport for a batch.
async function getBatchPassport(req, res, next) {
  try {
    const result = await getPassport(req.params.batchId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Digital passport not found",
      });
    }

    const { batch, events } = result;

    res.json({
      success: true,
      data: {
        passport: {
          batchId: batch.batchId,
          category: batch.category,
          weight: batch.weight,
          quantity: batch.quantity,
          source: batch.source,
          status: batch.status,
          collectionDate: batch.collectionDate,
          acceptedAt: batch.acceptedAt,
          recycledAt: batch.recycledAt,
          certificateUrl: batch.certificateUrl,
          shop: batch.shop,
          collector: batch.collector,
          recycler: batch.recycler,
        },
        history: events.map((event) => ({
          status: event.status,
          message: event.message,
          actor: event.actor,
          actorRole: event.actorRole,
          weight: event.weight,
          proofUrl: event.proofUrl,
          occurredAt: event.occurredAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getBatchPassport };
