const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    location:    { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // Citizen uploaded image (base64 stored as string)
    image: { type: String, default: null },

    // Department uploaded resolution image (base64)
    resolutionImage: { type: String, default: null },

    // AI classification
    category: {
      type: String,
      enum: ["Electrical","Roads","Sanitation","Water Supply","Emergency","Other"],
      default: "Other",
    },
    severity:       { type: String, enum: ["High","Medium","Low"], default: "Low" },
    confidenceScore:{ type: Number, default: 0 },
    department:     { type: String, default: null },

    // Status
    status:     { type: String, enum: ["Pending","Assigned","Resolved"], default: "Pending" },
    remarks:    { type: String, default: "" },
    resolvedAt: { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
