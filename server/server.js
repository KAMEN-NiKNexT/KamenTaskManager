// server/server.js
const express = require("express");
const path = require('path');

const app = express();
//app.use(cors({
//  origin: ['https://8203-178-208-82-215.ngrok-free.app'], // Укажите адрес вашего фронтенда
//  methods: ['GET', 'POST'],
//  allowedHeaders: ['Content-Type', 'Authorization']
//}));
//app.use((req, res, next) => {
//  res.setHeader("Content-Security-Policy", 
//    "default-src 'self'; " + // Разрешаем загрузку ресурсов только с того же домена
//    "style-src 'self' https://cdnjs.cloudflare.com; " + // Разрешаем стили с localhost и cdn
//    "script-src 'self' 'unsafe-inline' https://telegram.org https://cdnjs.cloudflare.com; " + // Разрешаем скрипты с localhost и cdn
//    "font-src 'self' https://cdnjs.cloudflare.com; " + // Разрешаем шрифты с cdn
//    "connect-src 'self' http://localhost:5000;"); // Разрешаем запросы к серверу с localhost
//  next();
//});
app.use(express.static(path.join(__dirname, '../src')));
// Подключаемся к базе данных MongoDB

// Middleware для парсинга JSON

// Маршрут для проверки и добавления пользователя
//app.post("/check-and-add-user", async (req, res) => {
//  const { telegramId, name, email } = req.body;
//
//  try {
//    // Проверка, есть ли пользователь в базе
//    let user = await User.findOne({ telegramId });
//
//    if (!user) {
//      // Если пользователя нет, создаем нового
//      user = new User({
//        telegramId,
//        name,
//        email,
//        tasks: [],
//      });
//
//      await user.save();
//      console.log("New user added:", user);
//      return res.status(201).json({ message: "User created", user });
//    }
//
//    // Если пользователь существует, возвращаем его данные
//    console.log("User already exists:", user);
//    return res.status(200).json({ message: "User exists", user });
//  } catch (error) {
//    console.error("Error checking or adding user:", error);
//    return res.status(500).json({ message: "Server error", error });
//  }
//});

// Стартуем сервер
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
