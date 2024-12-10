// models/user.js
const mongoose = require("mongoose");

// Схема пользователя
const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

// Модель пользователя
const User = mongoose.model("User", userSchema);
module.exports = User;
