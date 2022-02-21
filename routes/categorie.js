const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const Categorie = require("../models/categorie");

// validatie
const validate = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name is required, must be 3 characters long"),
  check("image")
    .isLength({ min: 15 })
    .withMessage("image is required, must be 15 characters long"),
];

// find info from categorie by id
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

// alle categorieën weergeven
router.get("/", async (req, res) => {
  try {
    const categorie = await Categorie.find().sort({ name: 1 });
    res.json(categorie);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// geef categorie met id
router.get("/:id", getCategorie, (req, res) => {
  res.json(res.categorie);
});

// Toevoegen van een categorie
router.post("/", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // Zoek of categorie al bestaat in de databank
  const categorieExist = await Categorie.findOne({ name: req.body.name });
  if (categorieExist) {
    return res
      .status(400)
      .send({ success: false, message: "Categorie already exist" });
  }
  const categorie = new Categorie({
    name: req.body.name.replace(/\w/, (c) => c.toUpperCase()), // eerste letter uppercase
    image: req.body.image,
  });
  try {
    const newCategorie = await categorie.save();
    res.status(201).send(newCategorie);
  } catch (err) {
    res.status(400).send({ success: false, err });
  }
});

// Aanpassen van een categorie
router.put("/:id", getCategorie, async (req, res) => {
  try {
    const putCategorie = await Categorie.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      image: req.body.image,
    });
    // Send response in here
    res.send(putCategorie);
  } catch (err) {
    console.error(err.message);
    res.send(400).send({ message: err.message });
  }
});

// Verwijder categorie
router.delete("/:id", getCategorie, async (req, res) => {
  try {
    await res.categorie.remove();
    res.send({ message: "Deleted categorie" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
