const express = require("express");
const knex = require("knex");
const knexConfig = require("../knexfile.js");

const router = express.Router();

const db = knex(knexConfig.development);

router.get("/", (req, res) => {
  res.status(200).json("working!");
  console.log("working");
});

router.get("/books", (req, res) => {
  db("books")
    .then(book => {
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ error: "Books not found" });
      }
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "The books information could not be retrieved." })
    );
});

module.exports = router;
