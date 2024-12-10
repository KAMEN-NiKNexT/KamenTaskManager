// routes/user.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { telegramId, name, email } = req.body;

  try {
    // Ищем пользователя по telegramId
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Если пользователя нет, создаём нового
      user = new User({
        telegramId,
        name,
        email,
        tasks: [],
      });

      await user.save(); // Сохраняем нового пользователя в базе
      return res.status(201).json({
        message: 'User created',
        user,
      });
    }

    // Если пользователь найден
    res.status(200).json({
      message: 'User already exists',
      user,
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
