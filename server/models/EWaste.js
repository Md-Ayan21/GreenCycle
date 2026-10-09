
const mongoose = require("mongoose");

const eWasteSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    weight: {
      type: Number,
      required: true,
      min: 0.01,
    },

    status: {
      type: String,
      enum: [
        "REGISTERED",
        "PICKUP REQUESTED",
        "PICKED UP",
        "BATCHED",
      ],
      default: "REGISTERED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EWaste", eWasteSchema);
