// server/server.js
const express = require("express");
const connectDB = require("./database"); // Импортируем функцию подключения к базе данных
const User = require("../models/user"); // Модель пользователя
const userRoutes = require('./routes/user');

const app = express();

// Подключаемся к базе данных MongoDB
connectDB();

// Middleware для парсинга JSON
app.use(express.json(), userRoutes);

// Маршрут для проверки и добавления пользователя
app.post("/check-and-add-user", async (req, res) => {
  const { telegramId, name, email } = req.body;

  try {
    // Проверка, есть ли пользователь в базе
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Если пользователя нет, создаем нового
      user = new User({
        telegramId,
        name,
        email,
        tasks: [],
      });

      await user.save();
      console.log("New user added:", user);
      return res.status(201).json({ message: "User created", user });
    }

    // Если пользователь существует, возвращаем его данные
    console.log("User already exists:", user);
    return res.status(200).json({ message: "User exists", user });
  } catch (error) {
    console.error("Error checking or adding user:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

// Стартуем сервер
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
