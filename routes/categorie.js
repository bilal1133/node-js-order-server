const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const Jimp = require("jimp");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const Categorie = require("../models/categorie");
const uploadImage = require("../utils/uploadImage");

// Upload options
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Validation
const validate = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name is required, must be 3 characters long"),
  check("image")
    .isLength({ min: 15 })
    .withMessage("image is required, must be 15 characters long"),
];

// Search category with ID
const getCategorie = async (req, res, next) => {
  let categorie;
  try {
    categorie = await Categorie.findById(req.params.id);
    if (categorie == null) {
      return res.status(404).send({ message: "Cannot find categorie" });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
  res.categorie = categorie;
  next();
};

// All categories
router.get("/", async (req, res) => {
  try {
    const categorie = await Categorie.find().sort({ name: 1 });
    res.json(categorie);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Category with ID
router.get("/:id", getCategorie, (req, res) => {
  res.json(res.categorie);
});

// Post a categoery
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ errors: "Image is Required" });
  } else if (!req.body.name) {
    return res.status(400).send({ errors: "Name is Required" });
  }

  const url = await uploadImage(req.file);
  const categorieExist = await Categorie.findOne({ name: req.body.name });
  if (categorieExist) {
    return res
      .status(400)
      .send({ success: false, message: "Categorie already exist" });
  }
  const categorie = new Categorie({
    name: req.body.name.replace(/\w/, (c) => c.toUpperCase()), // eerste letter uppercase
    image: url,
  });

  try {
    const newCategorie = await categorie.save();
    res.status(201).send(newCategorie);
  } catch (err) {
    console.log(err);
    res.status(400).send({ success: false, err });
  }
});

// Put a category
router.put("/:id", getCategorie, upload.single("image"), async (req, res) => {
  let url;
  if (req.file) {
    url = await uploadImage(req.file);
  }
  try {
    const putCategorie = await Categorie.findByIdAndUpdate(req.params.id, {
      ...req.body,
      image: url || res.categorie.image,
    });
    // Send response in here

    const catData = await Categorie.findById(req.params.id);
    res.send(catData);
  } catch (err) {
    console.error("-=-=-=-==-", err.message);
    res.send(400).send({ message: err.message });
  }
});

// Delete a category
router.delete("/:id", getCategorie, async (req, res) => {
  try {
    await res.categorie.remove();
    res.send({ message: "Deleted categorie" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
