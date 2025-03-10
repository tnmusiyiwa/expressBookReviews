const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const booksUrl = "https://api.example.com/books"; // Replace with your API or data source

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Both username and password are required!" });
  }

  const validUsername = isValid(username);
  if (!validUsername) {
    return res
      .status(400)
      .json({ message: "Username is already taken. Use another username!" });
  }

  users.push({ username, password });

  const savedUsers = users.map((user) => user.username);

  return res.status(200).json(savedUsers);
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  // Simulate asynchronous data fetching using Promise
  new Promise((resolve, reject) => {
    resolve(books);
  })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ message: "Error fetching books" });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
      resolve(book);
    } else {
      reject({ status: 404, message: "Book not found!" });
    }
  })
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // Simulate fetching book data asynchronously using a Promise
  new Promise((resolve, reject) => {
    const author = req.params.author;
    const filteredBooks = Object.values(books).filter((book) => {
      return book.author.toLowerCase().includes(author.toLowerCase());
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject({ status: 404, message: "No books found!" });
    }
  })
    .then((books) => {
      return res.status(200).json(books);
    })
    .catch((err) => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({
        message: "Server error: Error occurred getting book by author!",
      });
    });
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;

    // Simulate asynchronous behavior with a Promise
    const filteredBooks = await new Promise((resolve, reject) => {
      const booksByTitle = Object.values(books).filter((book) =>
        book.title.toLowerCase().includes(title.toLowerCase())
      );

      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject({ status: 404, message: "No books found!" });
      }
    });

    return res.status(200).json(filteredBooks);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({
      message: "Server error: Error occurred getting book by title!",
    });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) return res.status(404).json({ message: "Book not found!" });

    const reviews = book.reviews;
    if (reviews) {
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({ message: "Book has no reviews yet!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports.general = public_users;
