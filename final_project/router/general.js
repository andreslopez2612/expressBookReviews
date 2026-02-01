const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const bookList = new Promise((resolve, reject) => {
    resolve(books);
    reject("Unable to fetch book list");
  });

  bookList.then((bookList) => {
    return res.status(200).json(bookList);
  }).catch((err) => {
    return res.status(500).json({ message: "Error retrieving book list" });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  //Write your code here
  const bookDetails = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  bookDetails.then((book) => {
    return res.status(200).json(book);
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  const author = req.params.author;

  const booksByAuthor = new Promise((resolve, reject) => {
    const decodedAuthor = decodeURIComponent(author);
    const filteredBooks = Object.values(books).filter(book => book.author === decodedAuthor);
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("Books by this author not found");
    }
  });

  booksByAuthor.then((books) => {
    return res.status(200).json(books);
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const title = req.params.title;

  const booksByTitlePromise = new Promise((resolve, reject) => {
    const decodedTitle = decodeURIComponent(title);
    const booksByTitle = Object.values(books).filter(book => book.title === decodedTitle);
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("Books with this title not found");
    }
  });

  booksByTitlePromise.then((books) => {
    return res.status(200).json(books);
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
