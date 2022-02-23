const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const Product = require("../models/product");

// validatie
const validate = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name is required, must be 3 characters long"),
  check("image")
    .isLength({ min: 15 })
    .withMessage("image is required, must be 15 characters long"),
  check("price")
    .isFloat()
    .isLength({ min: 1 })
    .withMessage("Price is required, must be 1 characters long"),
  check("information")
    .isLength({ max: 255 })
    .withMessage("information is required, max 255 characters long"),
  check("categorie")
    .isLength({ min: 1 })
    .withMessage("categorie is required, categorie name not found/correct"),
];

// find info from product by id
const getProduct = async (req, res, next) => {
  let product;

  try {
    product = await Product.findById(req.params.id);
    if (product == null) {
      return res.status(404).send({ message: "Cannot find product" });
    }
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
  res.product = product;
  next();
};

// alle producten weergeven
router.get("/", async (req, res) => {
  try {
    const product = await Product.find().sort({ name: 1 });
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false, message: err.message });
  }
});

// geef product met id
router.get("/:id", getProduct, (req, res) => {
  res.json(res.product);
});

// Toevoegen van een product
router.post("/", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ success: false, errors: errors.array() });
  }
  // Zoek of product al bestaat in de databank
  const productExist = await Product.findOne({
    success: true,
    name: req.body.name,
  });
  if (productExist) {
    return res
      .status(400)
      .send({ success: false, message: "product already exist" });
  }
  const product = new Product({
    name: req.body.name.replace(/\w/, (c) => c.toUpperCase()), // eerste letter uppercase,
    image: req.body.image,
    price: req.body.price,
    information: req.body.information,
    categorie: req.body.categorie,
  });
  try {
    const newproduct = await product.save();
    res.status(201).send(newproduct);
  } catch (err) {
    res.status(400).send({ success: false, err });
  }
});

// Aanpassen van een product
router.put("/:id", getProduct, async (req, res) => {
  try {
    const putproduct = await product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      image: req.body.image,
      price: req.body.price,
      information: req.body.information,
      categorie: req.body.categorie,
    });
    // Send response in here
    res.send(putproduct);
  } catch (err) {
    res.send(400).send({ success: false, message: err.message });
  }
});

// Verwijder product
router.delete("/:id", getProduct, async (req, res) => {
  try {
    await res.product.remove();
    res.send({ success: true, message: "Deleted product" });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

module.exports = router;
