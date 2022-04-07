const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const auth = require("../Middlewares/auth");

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
    const orders = await Order.find().populate("user").sort({ fullname: 1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Find occurrence of product in orders
router.get("/product-occurrence", auth, async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: "products",
      populate: {
        path: "product_id",
        model: "Product",
      },
    });
    const ProductOccurences = orders
      .map((o) => o.products)
      .flat()
      .map((order) => ({ name: order.product_id.name, qty: order.qty }))
      .reduce((prev, current) => {
        if (prev[current.name]) {
          prev[current.name] = prev[current.name] + current.qty;
        } else {
          prev[current.name] = current.qty;
        }
        return prev;
      }, {});

    return res.send(ProductOccurences);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Get order by id
router.get("/:id", async (req, res) => {
  try {
    const orders = await Order.findOne({ _id: req.params.id })
      .populate("user")
      .populate({
        path: "products",
        populate: {
          path: "product_id",
          model: "Product",
        },
      });
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

module.exports = router;
