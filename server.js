const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Указываем директорию для статичных файлов
app.use(express.static(path.join(__dirname, 'src')));

// Обрабатываем запросы на главную страницу
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
