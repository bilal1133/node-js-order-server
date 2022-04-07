const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/user");

// Register validation
const validate = [
  check("fullName")
    .isLength({ min: 2 })
    .withMessage("Fullname is required, must be 2 characters long"),
  check("email").isEmail().withMessage("Please provide a valid email"),
  check("password")
    .isLength({ min: 4 })
    .withMessage("Password must be least 4 characters"),
];

// Login validation
const loginValidation = [
  check("email").isEmail().withMessage("Please provide a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be least 6 characters"),
];

// Token for user (client)
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      address: user.address,
      postalCode: user.postalCode,
      residence: user.residence,
      fullName: user.fullName,
      role: user.role,
    },
    process.env.JWT_PRIVATE_KEY
  );
};

// Post a register
router.post("/register", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // Search if e-mail exist
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res
      .status(400)
      .send({ success: false, message: "Email is reeds in gebruik." });
  }
  // Passwoord encyption
  const salt = await bcrypt.genSalt();
  const hasPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    fullName: req.body.fullName,
    address: req.body.address,
    postalCode: req.body.postalCode,
    residence: req.body.residence,
    email: req.body.email,
    password: hasPassword,
  });
  try {
    const savedUser = await user.save();
    let token;
    token = generateToken(user);
    // geef enkel deze gegevens weer
    res.send({
      success: true,
      data: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
      },
      token,
    });
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
});

// Post login
router.post("/login", loginValidation, async (req, res) => {
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // Check if e-mail exsist
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(404)
      .send({ succes: false, message: "Gebruiker niet geregistreerd." });
  // check id password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    return res.status(404).send({
      success: false,
      message: "E-mailadres of wachtwoord niet correct",
    });
  }

  const token = generateToken(user);
  res.header("auth-token", token).send({
    success: true,
    message: "Logged in successfully",
    token,
  });
});

module.exports = router;
