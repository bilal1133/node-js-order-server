const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/categorie");
const multer = require("multer");
const uploadImage = require("../utils/uploadImage");

// Upload options
const storage = multer.memoryStorage();
const uploadOptions = multer({ storage: storage });

// Validation
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

// Find info from product by id
const getProduct = async (req, res, next) => {
  let product;

  try {
    product = await Product.findById(req.params.id).populate("categorie");
    if (product == null) {
      return res.status(404).send({ message: "Cannot find product" });
    }
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
  res.product = product;
  next();
};

// All products
router.get("/", async (req, res) => {
  const { categorie } = req.query;
  try {
    let products;
    if (categorie) {
      products = await Product.find({ categorie: categorie }).sort({
        name: 1,
      });
    } else {
      products = await Product.find().sort({ name: 1 });
    }
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false, message: err.message });
  }
});

// Product with ID
router.get("/:id", getProduct, (req, res) => {
  res.json(res.product);
});

// Post product
router.post("/", uploadOptions.single("image"), async (req, res) => {
  const errors = validationResult(req);
  if (!req.file) {
    return res.status(400).send({ errors: "Image is Required" });
  } else if (!req.body.name) {
    return res.status(400).send({ errors: "Name is Required" });
  } else if (!req.body.information) {
    return res.status(400).send({ errors: "Information is Required" });
  } else if (!req.body.price) {
    return res.status(400).send({ errors: "price is Required" });
  }
  if (!errors.isEmpty()) {
    return res.status(400).send({ success: false, errors: errors.array() });
  }
  // Search if product exist in database
  const productExist = await Product.findOne({
    success: true,
    name: req.body.name,
  });
  if (productExist) {
    return res
      .status(400)
      .send({ success: false, message: "product already exist" });
  }
  // Search if category exist
  const categoryExists = await Category.findOne({
    success: true,
    _id: req.body.categorie,
  });
  if (!categoryExists) {
    return res
      .status(400)
      .send({ success: false, message: "Please choose Valid Categorie." });
  }

  // Filename from upload picture
  const url = await uploadImage(req.file);
  // try {
  // } catch (error) {
  //   console.log(error);
  //   return res.status(400).send();
  // }
  //pad where the pictures are stored

  const product = new Product({
    name: req.body.name.replace(/\w/, (c) => c.toUpperCase()), // eerste letter uppercase,
    image: url,
    price: req.body.price,
    information: req.body.information,
    categorie: req.body.categorie,
  });

  try {
    const newproduct = await product.save();
    const populatedProd = await Product.findById(newproduct._id).populate(
      "categorie"
    );
    res.status(201).send(populatedProd);
  } catch (err) {
    res.status(400).send({ success: false, err });
  }
});

// Put of a product
router.put(
  "/:id",
  uploadOptions.single("image"),
  getProduct,
  async (req, res) => {
    const errors = validationResult(req);
    const { name, information, price, categorie } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() });
    }
    if (categorie) {
      // Search if category exist
      const categoryExists = await Category.findOne({
        success: true,
        _id: categorie,
      });
      if (!categoryExists) {
        return res
          .status(400)
          .send({ success: false, message: "Please choose Valid Categorie." });
      }
    }
    let url;
    // Filename from upload picture
    if (req.file) {
      url = await uploadImage(req.file);
    }

    try {
      const newproduct = await Product.findByIdAndUpdate(req.params.id, {
        ...req.body,
        image: url || res.product.image,
      });
      const populatedProd = await Product.findById(newproduct._id).populate(
        "categorie"
      );
      res.status(201).send(populatedProd);
    } catch (err) {
      console.log("----", err);
      res.status(400).send({ success: false, err });
    }
  }
);

// Delete of a product
router.delete("/:id", getProduct, async (req, res) => {
  try {
    await res.product.remove();
    res.send({ success: true, message: "Deleted product" });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

module.exports = router;
