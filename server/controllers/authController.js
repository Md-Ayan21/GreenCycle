
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register a new shop account.
async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      address,
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone,
      businessName,
      address,
      role: "shop",
    });

    res.status(201).json({
      success: true,
      message: "Shop account created successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Log in an existing user.
async function login(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (
      !user ||
      !user.isActive ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Return the currently authenticated user's profile.
async function getMe(req, res) {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      businessName: req.user.businessName,
      isActive: req.user.isActive,
    },
  });
}

module.exports = {
  register,
  login,
  getMe,
};
