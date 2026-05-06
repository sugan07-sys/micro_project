const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
mongoose.connect("mongodb://127.0.0.1:27017/bookexchange")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ===== Models =====
const User = require("./models/User");
const Book = require("./models/Book");

// ===== ROUTES =====

// 🔹 Default Route
app.get("/", (req, res) => {
  res.send("🚀 Book Exchange Backend Running");
});

// 🔹 Register User
app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    const userObj = savedUser.toObject();
    delete userObj.password;
    res.json({ message: "✅ User Registered Successfully", user: userObj });
  } catch (err) {
    console.error("REGISTER_ERROR", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "❌ Email already registered" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Login User
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password
    }).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(400).json({ message: "❌ Invalid Credentials" });
    }
  } catch (err) {
    console.error("LOGIN_ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add Book
app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.json({ message: "📚 Book Added Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get All Books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete Book
app.delete("/books/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Book Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Start Server =====
app.listen(5000, () => {
  console.log("🔥 Server running at http://localhost:5000");
});