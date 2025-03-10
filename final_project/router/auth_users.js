const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check if the username is valid
  const existingUser = users.find((user) => user.username === username);
  return existingUser ? false : true;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const authUser = users.find(
    (user) => user.username === username && user.password === password
  );

  return authUser ? true : false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  try {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!review || !isbn) {
      return res.status(400).json({ message: "Review or ISBN not provided!" });
    }

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({
      message: "Review added/updated successfully!",
      reviews: book.reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving review!" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
