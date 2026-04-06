const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/complaints", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/stats", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const total        = await Complaint.countDocuments();
    const resolved     = await Complaint.countDocuments({ status: "Resolved" });
    const assigned     = await Complaint.countDocuments({ status: "Assigned" });
    const pending      = await Complaint.countDocuments({ status: "Pending" });
    const totalUsers   = await User.countDocuments({ role: "citizen" });
    const highSeverity = await Complaint.countDocuments({ severity: "High" });

    const byDepartment = await Complaint.aggregate([
      { $group: {
          _id: "$department",
          total:    { $sum: 1 },
          assigned: { $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          pending:  { $sum: { $cond: [{ $eq: ["$status", "Pending"]  }, 1, 0] } },
          high:     { $sum: { $cond: [{ $eq: ["$severity", "High"]   }, 1, 0] } },
      }},
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      stats: { total, resolved, assigned, pending, totalUsers, highSeverity },
      byDepartment
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;