const express = require("express");
const router = express.Router();
const Order = require("../models/order");

// Create an order
router.post("/", async (req, res) => {
  try {
    const order = await new Order(req.body).save();
    return res.status(201).send(order);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    return res.json(orders);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Get order by id
router.get("/:id", async (req, res) => {
  try {
    const orders = await Order.findOne({ _id: req.params.id });
    return res.json(orders);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Update an order
router.put("/:id", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });
    const updatedOrder = await Order.findById(req.params.id);
    return res.send(updatedOrder);
  } catch (err) {
    return res.send(400).send({ message: err.message });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    await Order.deleteOne({ _id: req.params.id });
    return res.send({ message: "Order Deleted" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Find occurrence of product in orders
router.get("/product-occurrence/:id", async (req, res) => {
  try {
    const orders = await Order.find(
      { "products.product_id": req.params.id },
      { "products.qty": 1, "products.product_id": 1 }
    );
    const count = orders
      .map((o) => o.products)
      .flat()
      .filter((o) => o.product_id == req.params.id)
      .reduce((partialSum, a) => partialSum + a.qty, 0);
    return res.send({ count });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;
