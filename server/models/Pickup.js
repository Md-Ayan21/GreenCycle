
const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    ewaste: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EWaste",
      required: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    collector: {
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

    address: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    actualWeight: {
      type: Number,
      min: 0.01,
      default: null,
    },

    proofUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["REQUESTED", "ASSIGNED", "PICKED UP"],
      default: "REQUESTED",
      index: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pickup", pickupSchema);
