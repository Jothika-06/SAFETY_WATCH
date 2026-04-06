const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ── Email validation ────────────────────────────────────
const FAKE_DOMAINS = [
  "test.com","fake.com","example.com","mailinator.com","guerrillamail.com",
  "tempmail.com","throwaway.email","yopmail.com","10minutemail.com","trashmail.com",
  "dispostable.com","spamgourmet.com","mailnull.com","maildrop.cc","sharklasers.com",
  "trash-mail.com","spam4.me","tempr.email","zetmail.com","binkmail.com",
  "clrmail.com","fakeinbox.com","getnada.com","harakirimail.com","trashmail.me",
  "trashmail.io","trashmail.at","trashmail.net","trashmail.org","mytempemail.com",
  "mintemail.com","getairmail.com","temporaryemail.net","temporary-email.com",
];

function isValidEmail(email) {
  // Basic format
  const fmt = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!fmt.test(email)) return false;
  if (email.includes("..")) return false;

  const [local, domain] = email.toLowerCase().split("@");
  if (!domain || domain.split(".").length < 2) return false;

  const tld = domain.split(".").pop();
  if (tld.length < 2 || /^\d+$/.test(tld)) return false;
  if (local.length < 2) return false;
  if (FAKE_DOMAINS.includes(domain)) return false;

  // Block short dummy domains
  const domainWithoutTLD = domain.substring(0, domain.lastIndexOf("."));
  if (domainWithoutTLD.length < 4) return false;

  const testPatterns = ["test","fake","sample","demo","placeholder","noemail","noreply","invalid","dummy","abc","xyz","foo","bar","baz","temp","null","none","random","asdf","qwerty"];
  if (testPatterns.includes(domainWithoutTLD)) return false;

  return true;
}

// POST /api/auth/register

router.post("/register", async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required." });

    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email address." });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered." });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "citizen",
      department: department || null,
    });

    console.log("USER CREATED:", user);

    const token = signToken(user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      token,
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });
    const token = signToken(user._id);
    res.json({ user:{ _id:user._id, name:user.name, email:user.email, role:user.role, department:user.department }, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (newPassword) {
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(400).json({ message: "Current password is incorrect." });
      user.password = newPassword;
    }
    await user.save();
    res.json({ message:"Profile updated.", user:{ _id:user._id, name:user.name, email:user.email, role:user.role, department:user.department } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
