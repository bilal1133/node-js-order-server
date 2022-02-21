const express = require("express");
const mongoose = require("mongoose");
const app = express();

const authRoutes = require("./routes/auth");
const categorie = require("./routes/categorie");
const product = require("./routes/product");
const information = require("./routes/information");
const newsFeed = require("./routes/newsFeed");
const order = require("./routes/order");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the auth system");
});

//interceptor is voor front
// url
app.use("/api/users", authRoutes);
app.use("/api/categorie", categorie);
app.use("/api/product", product);
app.use("/api/information", information);
app.use("/api/newsFeed", newsFeed);
app.use("/api/order", order);

require("dotenv").config();
const port = process.env.PORT || 4000;

// connectie databank + poort
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.mhhag.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(port, () => console.log("Server is running")))
  .catch((err) => console.log(err));
