const express = require("express");

const router = express.Router();

router.get("/books", (req, res) => {
  res.status(200).json("working!");
  console.log("working");
});

module.exports = router;
