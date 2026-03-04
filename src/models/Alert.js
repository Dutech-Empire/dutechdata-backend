import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH",
    },

    message: {
      type: String,
    },

    details: {
      type: Object,
    },

    resolved: {
      type: Boolean,
      default: false,
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick filtering of unresolved alerts
alertSchema.index({ resolved: 1, createdAt: -1 });

export default mongoose.model("Alert", alertSchema);