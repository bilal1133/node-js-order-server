
const { default: mongoose } = require("mongoose");
const request = require("supertest");
const app = require("../index");

test(" Should return list of products ", () => {
  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.mhhag.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    )
    .then(async () => {
      await request(app)
        .get("/api/product")
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
        });
    });
});
