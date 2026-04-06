const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      // Maps to complaint categories
      enum: ["Electrical", "Roads", "Sanitation", "Water Supply", "Emergency"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);