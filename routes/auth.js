const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/user");

// register validatie
const validate = [
  check("fullName")
    .isLength({ min: 2 })
    .withMessage("Fullname is required, must be 2 characters long"),
  check("email").isEmail().withMessage("Please provide a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be least 6 characters"),
];

// login validatie
const loginValidation = [
  check("email").isEmail().withMessage("Please provide a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be least 6 characters"),
];

// Token aanmaken voor user client
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
    "SUPERSECRET123"
  );
};

router.post("/register", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  //Zoek of email al bestaat in de databank
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res
      .status(400)
      .send({ success: false, message: "Email already exist" });
  }
  //Wachtwoord encypteren
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

router.post("/login", loginValidation, async (req, res) => {
  // validatie
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // check of email bestaat in de databank
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(404)
      .send({ succes: false, message: "User not registered" });
  // check of paswoord is correct met de databank
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    return res
      .status(404)
      .send({ success: false, message: "Email of password not correct" });
  }

  const token = generateToken(user);
  res.header("auth-token", token).send({
    success: true,
    message: "Logged in successfully",
    token,
  });
});

module.exports = router;
