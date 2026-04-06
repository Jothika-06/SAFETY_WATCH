const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    inputText: {
      type: String,
      required: true,
    },
    predictedCategory: {
      type: String,
      required: true,
    },
    predictedSeverity: {
      type: String,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIAnalysis", aiAnalysisSchema); 