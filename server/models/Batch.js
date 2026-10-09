
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickup",
      required: true,
      unique: true,
    },

    ewaste: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EWaste",
      required: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    recycler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0.01,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    source: {
      type: String,
      default: "",
    },

    collectionDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "AT COLLECTION CENTER",
        "SENT TO RECYCLER",
        "RECYCLING CONFIRMED",
      ],
      default: "AT COLLECTION CENTER",
      index: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    recycledAt: {
      type: Date,
      default: null,
    },

    certificateUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
