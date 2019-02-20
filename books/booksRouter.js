const express = require("express");
const knex = require("knex");
const knexConfig = require("../knexfile.js");

const router = express.Router();

const db = knex(knexConfig.development);

const { authenticate } = require("../auth/authenticate.js");

router.get("/", (req, res) => {
  res.status(200).json("working!");
  console.log("working");
});

router.get("/books", authenticate, async (req, res) => {
  try {
    let books = await db("books");
    if (books) {
        books = books.map(async ({ user_id, ...book }) => {
          try {
            var adder = await db("users").where("id", user_id).first();
          } catch(err) {
            res.status(500).json({
              error: "Something went wrong while retrieving books' singular information."
            });
          }

          return {
            ...book,
            adder: adder.username
          };
        })
      
        Promise.all(books)
          .then(books => {
            res.status(200).json(books);
          });
    } else {
      res.status(404).json({ error: "Books not found" });
    }
  } catch(err) {
    res
      .status(500)
      .json({ error: "The books information could not be retrieved." })
  }
});

router.get("/books/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    var book = await db("books").where({ id }).first();
    var reviews = await db("reviews").where("book_id", id);
    var adder = await db("users").where("id", book.user_id).first();
  } catch(err) {
    res.status(500).json({ err: "The book and reviews could not be retrieved." });
  }

  Promise.all([ book, reviews, adder ])
    .then(([ book, reviews, adder ]) => {
      const { user_id, ...bookToSend } = book;
      res.status(200).json({
        ...bookToSend,
        adder: adder.username,
        reviews: reviews.map(review => ({
          id: review.id,
          reviewer: review.reviewer,
          review: review.review,
          rating: review.rating
        }))
      })
    })
    .catch(err => {
      res
        .status(500)
        .json({ err: "The book and reviews could not be retrieved." });
    });
});

router.post("/books", async (req, res) => {
  const {
    title, author, publisher, license, subject, image, adder
  } = req.body;

  if (
    !title ||
    !author ||
    !publisher ||
    !license ||
    !subject ||
    !image ||
    !adder
  ) {
    res.status(422).json({ error: "Please fill in all categories!" });
  } else {
    user_id = await db("users").then(users => {
      return users.find(user => user.username === adder).id;
    });

    db.insert({ title, author, publisher, license, subject, image, user_id })
      .into("books")
      .then(book => {
        res.status(201).json(book);
      })
  }
});

router.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  db("books")
    .where({ id: id })
    .del()
    .then(count => {
      if (count) {
        res.status(200).json({ count, id });
      } else {
        res.status(404).json({ error: "Book not found!" });
      }
    })
    .catch(err => {
      res.status(500).json({ error: "The book could not be removed." });
    });
});

router.put("/books/:id", (req, res) => {
  const changes = req.body;
  const { id } = req.params;
  db("books")
    .where({ id: id })
    .update(changes)
    .then(count => {
      res.status(200).json(count);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The books information could not be modified." });
    });
});

module.exports = router;
