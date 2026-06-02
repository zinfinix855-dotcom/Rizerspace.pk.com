const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const emailService = require("../services/emailService");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";


// Helper to parse cookies from headers manually (no external dependency needed)
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(cookie => {
    const [name, ...valueParts] = cookie.split("=");
    if (name) {
      cookies[name.trim()] = valueParts.join("=").trim();
    }
  });
  return cookies;
};

// Generate Access Token (short-lived, 15 minutes)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "rizerspace_secret_key_1337", {
    expiresIn: "15m"
  });
};

// Generate Refresh Token (long-lived, 7 days)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "rizerspace_secret_key_1337", {
    expiresIn: "7d"
  });
};

// @desc    Register a new user & trigger email verification (with SHA-256 hashed token)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create plaintext token to send, but hash it using SHA-256 for database storage
    const rawVerificationToken = crypto.randomBytes(20).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(rawVerificationToken).digest("hex");
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      verificationToken: hashedVerificationToken,
      verificationTokenExpire
    });

    if (user) {
      // Send verification email (falls back to console in dev)
      const verificationUrl = `${FRONTEND_URL}/verify-email?token=${rawVerificationToken}`;
      await emailService.sendVerification(user.email, user.name, verificationUrl);


      // Issue refresh & access tokens for instant logging in on registration
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user session array
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await user.save();

      // Set cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        message: "Registration successful. Please check your console/email for the verification link.",
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          collectorLevel: user.collectorLevel,
          collectorXP: user.collectorXP,
          badges: user.badges,
          loyaltyPoints: user.loyaltyPoints,
          referralCode: user.referralCode
        }
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get tokens (HttpOnly Refresh Token + JSON Access Token)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ── Unknown user ─────────────────────────────────────────────────────────
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ── Account locked? ───────────────────────────────────────────────────────
    if (user.isLocked) {
      const retryAfterMs = user.lockUntil - Date.now();
      const retryMins    = Math.ceil(retryAfterMs / 60000);
      return res.status(429).json({
        error: `Account temporarily locked due to too many failed attempts. Try again in ${retryMins} minute(s).`
      });
    }

    // ── Password check ────────────────────────────────────────────────────────
    const passwordMatch = await user.matchPassword(password);

    if (!passwordMatch) {
      await user.incLoginAttempts();
      // Re-fetch to get fresh attempt count after update
      const fresh = await User.findById(user._id).select('loginAttempts lockUntil');
      const attemptsLeft = Math.max(0, 5 - (fresh?.loginAttempts || 0));
      return res.status(401).json({
        error: attemptsLeft > 0
          ? `Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`
          : "Account locked for 30 minutes due to too many failed login attempts."
      });
    }

    // ── Successful login — clear lockout counter ──────────────────────────────
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.clearLoginAttempts();
    }

    // Generate double tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    // Set HttpOnly secure cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        wishlist: user.wishlist,
        addresses: user.addresses,
        collectorLevel: user.collectorLevel,
        collectorXP: user.collectorXP,
        badges: user.badges,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email token (hashes input to compare against database)
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Compute SHA-256 hash of the received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({
      message: "Email successfully verified!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request forgot password token (pre-hashes token in DB)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Generate reset token
    const rawResetToken = crypto.randomBytes(20).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email (falls back to console in dev)
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawResetToken}`;
    await emailService.sendPasswordReset(user.email, user.name, resetUrl);


    res.json({
      message: "Password reset link generated. Check the server console or email."
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token (hashes token to query DB)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    // Compute SHA-256 hash of token to compare
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Change password (will trigger hashing in pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token & rotate refresh token (RTR)
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const clientRefreshToken = cookies.refreshToken || req.body.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    // Find user with this refresh token in active sessions
    const user = await User.findOne({ "refreshTokens.token": clientRefreshToken });

    // 🚨 TOKEN REUSE DETECTION (Session Compromise Detection)
    if (!user) {
      try {
        // Decode token to see if it's signed by us
        const decoded = jwt.verify(clientRefreshToken, process.env.JWT_SECRET || "rizerspace_secret_key_1337");
        
        // If the token signature is valid but it's not in the DB, it's a compromised old token!
        // Immediately revoke ALL sessions for this user for security.
        const compromisedUser = await User.findById(decoded.id);
        if (compromisedUser) {
          compromisedUser.refreshTokens = [];
          await compromisedUser.save();
          console.warn(`🚨 WARNING: Refresh token reuse detected! Revoked all sessions for user: ${compromisedUser.email}`);
        }
      } catch (err) {
        // Token was fake or expired, ignore revocation
      }

      res.clearCookie("refreshToken");
      return res.status(403).json({ error: "Session expired or compromised. Please log in again." });
    }

    // Check if refresh token is expired
    const activeToken = user.refreshTokens.find(rt => rt.token === clientRefreshToken);
    if (!activeToken || activeToken.expiresAt < new Date()) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== clientRefreshToken);
      await user.save();
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Refresh token expired" });
    }

    // Verify token signature
    let decoded;
    try {
      decoded = jwt.verify(clientRefreshToken, process.env.JWT_SECRET || "rizerspace_secret_key_1337");
    } catch (err) {
      // Signature invalid
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== clientRefreshToken);
      await user.save();
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid refresh token signature" });
    }

    // Rotate tokens!
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Swap old refresh token with new rotated token
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== clientRefreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    // Set new rotating cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        wishlist: user.wishlist,
        addresses: user.addresses,
        collectorLevel: user.collectorLevel,
        collectorXP: user.collectorXP,
        badges: user.badges,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear refresh session
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const clientRefreshToken = cookies.refreshToken || req.body.refreshToken;

    if (clientRefreshToken) {
      // Clear token from DB
      await User.updateOne(
        { "refreshTokens.token": clientRefreshToken },
        { $pull: { refreshTokens: { token: clientRefreshToken } } }
      );
    }

    // Clear client cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.json({ message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser
};
