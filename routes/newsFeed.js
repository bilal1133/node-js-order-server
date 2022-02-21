const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const NewsFeed = require("../models/newsFeed");

// validatie
const validate = [
  check("newsFeed")
    .isLength({ min: 3 })
    .withMessage("Name is required, must be 3 characters long"),
];

// find info from newsFeed by id
const getNewsFeed = async (req, res, next) => {
  let newsFeed;
  try {
    newsFeed = await NewsFeed.findById(req.params.id);
    if (newsFeed == null) {
      return res.status(404).send({ message: "Cannot find the newsFeed" });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
  res.newsFeed = newsFeed;
  next();
};

// Alle newsFeed weergeven
router.get("/", async (req, res) => {
  try {
    const newsFeed = await NewsFeed.find();
    res.json(newsFeed);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// geef information met id
router.get("/:id", getNewsFeed, (req, res) => {
  res.json(res.newsFeed);
});

// Toevoegen van newsFeed
router.post("/", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // Zoek of newsFeed al bestaat in de databank
  const newsFeedExist = await NewsFeed.findOne({ info: req.body.info });
  if (newsFeedExist) {
    return res
      .status(400)
      .send({ success: false, message: "newsFeed already exist" });
  }
  const newsFeed = new NewsFeed({
    newsFeed: req.body.newsFeed,
  });
  try {
    const newNewsFeed = await newsFeed.save();
    res.status(201).send(newNewsFeed);
  } catch (err) {
    res.status(400).send({ success: false, err });
  }
});

// Aanpassen van newsFeed
router.put("/:id", getNewsFeed, async (req, res) => {
  try {
    const putnewsFeed = await NewsFeed.findByIdAndUpdate(req.params.id, {
      newsFeed: req.body.newsFeed,
    });
    // Send response in here
    res.send(putnewsFeed);
  } catch (err) {
    res.send(400).send({ message: err.message });
  }
});

// Verwijder newsFeed
router.delete("/:id", getNewsFeed, async (req, res) => {
  try {
    await res.newsFeed.remove();
    res.send({ message: "Deleted newsFeed" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
