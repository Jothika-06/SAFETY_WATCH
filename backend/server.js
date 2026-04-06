const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");
const path     = require("path");

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "20mb" }));         // allow large base64 images
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── Serve uploaded images statically ──────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/admin",      require("./routes/adminRoutes"));
app.use("/api/department", require("./routes/departmentRoutes"));

// ── Health Check ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "SafetyWatch API is running ✅" });
});

// ── Connect MongoDB & Start Server ────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
