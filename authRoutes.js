const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema
} = require("../validation/schemas");
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/logout", logoutUser);

module.exports = router;

