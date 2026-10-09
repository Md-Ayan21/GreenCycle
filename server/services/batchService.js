
const BatchEvent = require("../models/BatchEvent");

async function recordBatchEvent({
  batch,
  status,
  message,
  actor = null,
  actorRole = "system",
  weight = null,
  proofUrl = "",
}) {
  const event = await BatchEvent.create({
    batch,
    status,
    message,
    actor,
    actorRole,
    weight,
    proofUrl,
    occurredAt: new Date(),
  });

  return event;
}

module.exports = {
  recordBatchEvent,
};
