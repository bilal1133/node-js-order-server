const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const Information = require("../models/information");

// validatie
const validate = [
  check("information").isLength({ min: 15 }).withMessage("Info is required"),
];

// find info from information by id
const getInformation = async (req, res, next) => {
  let information;
  try {
    information = await Information.findById(req.params.id);
    if (information == null) {
      return res.status(404).send({ message: "Cannot find information" });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
  res.information = information;
  next();
};

// alle information weergeven
router.get("/", async (req, res) => {
  try {
    const information = await Information.find();
    res.json(information);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// geef information met id
router.get("/:id", getInformation, (req, res) => {
  res.json(res.information);
});

// Toevoegen van een informatie
router.post("/", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // Zoek of informatie al bestaat in de databank
  const informationExist = await Information.count();
  if (informationExist === 1) {
    return res.status(400).send({
      success: false,
      message: "Information already exist, only edit allowed",
    });
  }
  const information = new Information({
    information: req.body.information,
  });
  try {
    const newinformation = await information.save();
    res.status(201).send(newinformation);
  } catch (err) {
    res.status(400).send({ success: false, err });
  }
});

// Aanpassen van de information
router.put("/:id", getInformation, async (req, res) => {
  try {
    const putInformation = await Information.findByIdAndUpdate(req.params.id, {
      information: req.body.information,
    });
    // Send response in here
    res.send(putInformation);
  } catch (err) {
    res.send(400).send({ message: err.message });
  }
});

// Verwijder van de informatie
router.delete("/:id", getInformation, async (req, res) => {
  try {
    await res.information.remove();
    res.send({ message: "Deleted information" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
