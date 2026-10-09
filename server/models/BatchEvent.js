
const mongoose = require("mongoose");

const batchEventSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorRole: {
      type: String,
      enum: ["shop", "collector", "admin", "recycler", "system"],
      default: "system",
    },

    weight: {
      type: Number,
      default: null,
    },

    proofUrl: {
      type: String,
      default: "",
    },

    occurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

batchEventSchema.index({ batch: 1, occurredAt: 1 });

module.exports = mongoose.model("BatchEvent", batchEventSchema);
