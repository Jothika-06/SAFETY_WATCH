const express   = require("express");
const router    = express.Router();
const Complaint = require("../models/Complaint");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ── GET /api/department/complaints ────────────────────
router.get("/complaints", protect, authorizeRoles("department"), async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ message: "No department assigned to this account." });
    }

    const complaints = await Complaint.find({ department: req.user.department })
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Get department complaints error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── PUT /api/department/complaints/:id — Resolve complaint ──
router.put("/complaints/:id", protect, authorizeRoles("department"), async (req, res) => {
  try {
    const { remarks, resolutionImage } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: "Resolution remarks are required." });
    }

    // Validate resolution image size if provided (~5MB base64 ≈ 7MB string)
    if (resolutionImage && resolutionImage.length > 7 * 1024 * 1024) {
      return res.status(400).json({ message: "Resolution image too large. Maximum size is 5MB." });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (!req.user.department) {
      return res.status(400).json({ message: "No department assigned to this account." });
    }

    if (complaint.department !== req.user.department) {
      return res.status(403).json({ message: "Not authorized to resolve this complaint." });
    }

    if (complaint.status === "Resolved") {
      return res.status(400).json({ message: "Complaint is already resolved." });
    }

    complaint.status     = "Resolved";
    complaint.remarks    = remarks.trim();
    complaint.resolvedAt = new Date();

    if (resolutionImage) {
      complaint.resolutionImage = resolutionImage;
    }

    await complaint.save();

    res.status(200).json({
      message: "Complaint resolved successfully.",
      complaint
    });
  } catch (error) {
    console.error("Resolve complaint error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;