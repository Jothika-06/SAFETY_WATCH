const express  = require("express");
const router   = express.Router();
const axios    = require("axios");
const Complaint = require("../models/Complaint");
const AIAnalysis = require("../models/AIAnalysis");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const categoryToDept = {
  Electrical: "Electrical Department",
  Electricity: "Electrical Department",
  Streetlight: "Electrical Department",

  Road: "Road Maintenance Department",
  Roads: "Road Maintenance Department",
  Pothole: "Road Maintenance Department",

  Garbage: "Sanitation Department",
  Sanitation: "Sanitation Department",
  Waste: "Sanitation Department",

  Water: "Water Supply Department",
  "Water Supply": "Water Supply Department",
  Pipe: "Water Supply Department",
  Leak: "Water Supply Department",

  Drainage: "Drainage Department",
  Sewage: "Drainage Department",

  Emergency: "Emergency Department",

  Other: "General Department"
};

// ── POST /api/complaints — Submit complaint (with optional base64 image) ──
router.post("/", protect, authorizeRoles("citizen"), async (req, res) => {
  try {
    const { location, description, image } = req.body;

    if (!location || !description) {
      return res.status(400).json({ message: "Location and description are required" });
    }

    // Validate image size if provided (max ~5MB base64)
    if (image && image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ message: "Image too large. Maximum size is 5MB." });
    }

    // AI classification
    let category = "Other", severity = "Low", confidenceScore = 0;
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, { description });
      category        = aiResponse.data.category;
      severity        = aiResponse.data.severity;
      confidenceScore = aiResponse.data.confidence_score;
    } catch (aiError) {
      console.log("⚠️ AI service unavailable, using defaults");
    }

    const department = categoryToDept[category] || "General Department";

    const complaint = await Complaint.create({
      userId:      req.user._id,
      userName:    req.user.name,
      location,
      description,
      image:       image || null,
      category,
      severity,
      confidenceScore,
      department,
      status: "Assigned",
    });

    await AIAnalysis.create({
      complaintId:       complaint._id,
      inputText:         description,
      predictedCategory: category,
      predictedSeverity: severity,
      confidenceScore,
    });

    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── GET /api/complaints/my ────────────────────────────
router.get("/my", protect, authorizeRoles("citizen"), async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── GET /api/complaints/:id ───────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.status(200).json({ complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
