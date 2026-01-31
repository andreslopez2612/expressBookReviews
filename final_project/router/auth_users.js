const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const user = users.find(user => user.username === username);

  const token = jwt.sign({ username: user.username }, "access", { expiresIn: "1h" });
  req.session.authorization = token;
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user?.username;

  // Validar existencia del libro
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Validar review
  if (typeof review !== "string" || !review.trim()) {
    return res.status(400).json({ message: "Valid review is required" });
  }

  // Crear o actualizar review
  book.reviews[username] = review.trim();

  return res.status(200).json({
    message: "Review saved successfully",
    isbn,
    title: book.title,
    reviewer: username,
    review: book.reviews[username],
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user?.username;

  // Validar existencia del libro
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Validar existencia de la review
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review by this user not found" });
  }

  // Eliminar review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    isbn,
    title: book.title,
    reviewer: username,
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
