const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "moderator", "finance", "admin"], default: "customer" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  addresses: [AddressSchema],
  isVerified: { type: Boolean, default: false },
  
  // SHA-256 Hashed security tokens
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Security & Session
  mfaSecret: { type: String },
  mfaEnabled: { type: Boolean, default: false },
  refreshTokens: [{
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  }],

  // Brute-force lockout (5 attempts → 15-min lock)
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  // Collector Gamification & Stats
  collectorLevel: { type: Number, default: 1 },
  collectorXP: { type: Number, default: 0 },
  badges: [{
    name: { type: String, required: true },
    icon: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  publicShowcase: { type: Boolean, default: true },
  
  // Loyalty & Referrals
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true
});

// Virtual: true when the account is currently locked
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for fast auth lookups
UserSchema.index({ email: 1 });
UserSchema.index({ referralCode: 1 }, { sparse: true });
UserSchema.index({ 'refreshTokens.token': 1 });

// Encrypt password before saving & generate referralCode slug
UserSchema.pre("save", async function(next) {
  if (!this.referralCode) {
    this.referralCode = "RIZER-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Increment failed login counter; lock after 5 failures for 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS   = 30 * 60 * 1000; // 30 minutes

UserSchema.methods.incLoginAttempts = async function () {
  // If a previous lock has expired, restart the counter
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set:   { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock the account on the 5th consecutive failure
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
  }
  return this.updateOne(updates);
};

// Reset lockout counter on successful login
UserSchema.methods.clearLoginAttempts = async function () {
  return this.updateOne({
    $set:   { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model("User", UserSchema);

