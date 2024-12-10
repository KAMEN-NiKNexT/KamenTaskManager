var _a, _b, _c;
var taskContainer = document.getElementById("task-container");
var addTaskBtn = document.getElementById("add-task-btn");
var popup = document.getElementById("popup");
var closePopupBtn = document.getElementById("close-popup-btn");
var form = document.getElementById("task-form");
var tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
// Показать popup
addTaskBtn.addEventListener("click", function () {
    popup.classList.remove("hidden");
});
// Закрыть popup
closePopupBtn.addEventListener("click", function () {
    closePopup();
});
// Функция для закрытия попапа
function closePopup() {
    var _a;
    (_a = document.getElementById('popup')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    currentTaskId = null; // Сброс ID задачи
    form.reset();
}
function closeEditPopup() {
    var _a;
    (_a = document.getElementById('edit_popup')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    currentTaskId = null; // Сброс ID задачи
    form.reset();
}
// Добавление задачи
form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("task-name").value.trim();
    var importance = parseInt(document.getElementById("task-importance").value, 10);
    var description = document.getElementById("task-description").value.trim();
    var deadline = document.getElementById("task-deadline").value;
    if (!name || isNaN(importance) || importance < 1 || importance > 5) {
        alert("Please fill out all required fields correctly.");
        return;
    }
    var newTask = {
        id: crypto.randomUUID(),
        name: name,
        importance: importance,
        description: description,
        deadline: deadline,
        subtasks: [],
        state: "default",
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closePopup();
});
function addSubtask(task, subtaskName) {
    var newSubtask = {
        id: generateUniqueId(), // Уникальный идентификатор подзадачи
        name: subtaskName,
        state: "pending",
    };
    task.subtasks.push(newSubtask);
    saveTasks();
}
function removeSubtask(task, subtaskId) {
    task.subtasks = task.subtasks.filter(function (subtask) { return subtask.id !== subtaskId; });
    saveTasks();
    renderTasks();
}
function markSubtaskAsCompleted(task, subtaskId) {
    var subtask = task.subtasks.find(function (subtask) { return subtask.id === subtaskId; });
    if (subtask) {
        subtask.state = "completed";
        saveTasks();
        renderTasks();
    }
}
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9); // Генерирует случайный ID
}
function createSubtaskElement(task, subtask) {
    var subtaskEl = document.createElement("div");
    subtaskEl.className = "subtask ".concat(subtask.state);
    // Создаём HTML-разметку для подзадачи
    subtaskEl.innerHTML = "\n    <div class=\"subtask-content\">".concat(subtask.name, "</div>\n    <div class=\"subtask-actions\">\n      <input type=\"checkbox\" class=\"complete-checkbox\" ").concat(subtask.state === "completed" ? "checked" : "", " />\n      <button class=\"edit-btn-sub\"><i class=\"fas fa-edit\"></i></button>\n      <button class=\"delete-btn-sub\"><i class=\"fas fa-trash\"></i></button>\n    </div>\n  ");
    var subtaskContent = subtaskEl.querySelector(".subtask-content");
    var completeCheckbox = subtaskEl.querySelector(".complete-checkbox");
    var editButton = subtaskEl.querySelector(".edit-btn-sub");
    var deleteButton = subtaskEl.querySelector(".delete-btn-sub");
    // Обработчик для кнопки редактирования
    editButton.addEventListener("click", function () {
        var newSubtaskName = prompt("Введите новое название подзадачи:", subtask.name);
        if (newSubtaskName && newSubtaskName.trim() !== "") {
            subtask.name = newSubtaskName.trim();
            subtaskContent.textContent = newSubtaskName.trim(); // Обновляем текст подзадачи
            saveTasks();
            renderTasks();
        }
    });
    // Обработчик для чекбокса "Выполнено"
    completeCheckbox.addEventListener("change", function () {
        if (completeCheckbox.checked) {
            subtask.state = "completed";
            subtaskContent.style.textDecoration = "line-through";
            subtaskContent.style.opacity = "0.5"; // Сделать текст полупрозрачным
        }
        else {
            subtask.state = "active";
            subtaskContent.style.textDecoration = "none";
            subtaskContent.style.opacity = "1"; // Сделать текст непрозрачным
        }
        saveTasks();
        renderTasks();
    });
    // Обработчик для кнопки "Удалить"
    deleteButton.addEventListener("click", function () {
        var index = task.subtasks.indexOf(subtask);
        if (index !== -1) {
            task.subtasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    });
    return subtaskEl;
}
// Сохранение задач в localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
// Рендеринг задач
function renderTasks() {
    taskContainer.innerHTML = "";
    tasks.forEach(function (task) {
        taskContainer.appendChild(createTaskElement(task));
    });
}
// Завершить задачу
function markAsCompleted(task) {
    if (task.state == "completed")
        task.state = "default";
    else
        task.state = "completed";
    saveTasks();
    renderTasks(); // Обновляем UI
}
function markAsCanceled(task) {
    if (task.state == "canceled")
        task.state = "default";
    else
        task.state = "canceled";
    saveTasks();
    renderTasks(); // Обновляем UI
}
// Создание элемента задачи
function createTaskElement(task) {
    var _a, _b, _c, _d;
    var taskEl = document.createElement("div");
    taskEl.className = "task ".concat(task.state);
    taskEl.draggable = true;
    taskEl.innerHTML = "\n    <div>\n      <strong>".concat(task.name, "</strong> (Importance: ").concat(task.importance, ")\n    </div>\n    <div>").concat(task.description || "", "</div>\n    <div>").concat(task.deadline || "", "</div>\n    <button class=\"edit-btn-task\"><i class=\"fas fa-edit\"></i></button> <!-- \u041A\u043D\u043E\u043F\u043A\u0430 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0437\u0430\u0434\u0430\u0447\u0438 -->\n    <button class=\"add-subtask-btn\">+</button>\n    <div class=\"subtasks-container\"></div>\n  ");
    var subtasksContainer = taskEl.querySelector(".subtasks-container");
    var editButton = taskEl.querySelector('.edit-btn-task');
    // Обработчик кнопки редактирования задачи
    editButton.addEventListener('click', function () {
        openEditTaskPopup(task);
    });
    // Отображаем все подзадачи
    task.subtasks.forEach(function (subtask) {
        subtasksContainer.appendChild(createSubtaskElement(task, subtask));
    });
    // Обработчик кнопки редактирования задачи
    //editButton.addEventListener("click", () => {
    //  const newTaskName = prompt("Введите новое название задачи:", task.name);
    //  if (newTaskName && newTaskName.trim() !== "") {
    //    task.name = newTaskName.trim(); // Обновляем название задачи
    //    taskEl.querySelector("strong")!.textContent = newTaskName.trim(); // Обновляем текст задачи
    //    saveTasks();
    //    renderTasks();
    //  }
    //});
    taskEl.addEventListener("dragstart", function (e) {
        var _a;
        taskEl.classList.add("dragging");
        (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", task.id);
    });
    // Обработчик для завершения перетаскивания
    taskEl.addEventListener("dragend", function () {
        taskEl.classList.remove("dragging");
    });
    // Обработчик кнопки добавления подзадачи
    var addSubtaskButton = taskEl.querySelector(".add-subtask-btn");
    addSubtaskButton.addEventListener("click", function () {
        var newSubtaskName = prompt("Введите название подзадачи:");
        if (newSubtaskName) {
            addSubtask(task, newSubtaskName);
            // После добавления подзадачи обновим отображение
            renderTasks();
        }
    });
    // Добавляем кнопки "Выполнено", "Отменить" и "Удалить"
    var buttons = document.createElement("div");
    buttons.className = "task-buttons";
    buttons.innerHTML = "\n    <button class=\"complete-btn\">\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E</button>\n    <button class=\"cancel-btn\">\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C</button>\n    <button class=\"delete-btn\">\n      <i class=\"fas fa-trash\"></i> <!-- \u0418\u043A\u043E\u043D\u043A\u0430 \u043C\u0443\u0441\u043E\u0440\u043A\u0438 -->\n    </button>";
    // Обработчик кнопки "Выполнено"
    (_a = buttons.querySelector(".complete-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        var taskToComplete = tasks.find(function (t) { return t.id === task.id; });
        if (taskToComplete) {
            markAsCompleted(taskToComplete);
        }
    });
    // Обработчик кнопки "Отменить"
    (_b = buttons.querySelector(".cancel-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
        var taskToCancel = tasks.find(function (t) { return t.id === task.id; });
        if (taskToCancel) {
            markAsCanceled(taskToCancel);
        }
    });
    // Обработчик кнопки "Удалить"
    (_c = buttons.querySelector(".delete-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
        openDeletePopup(task.id);
    });
    // Если задача выполнена, скрыть кнопку удаления
    if (task.state === "completed") {
        (_d = buttons.querySelector(".delete-btn")) === null || _d === void 0 ? void 0 : _d.classList.add("hidden");
    }
    taskEl.appendChild(buttons);
    // Сохраняем ID задачи, чтобы можно было получить доступ к элементу при перерисовке
    taskEl.dataset.id = task.id;
    // Обработчик для перетаскивания задачи в контейнере
    taskEl.addEventListener("dragover", function (e) {
        e.preventDefault();
        var draggingTask = document.querySelector(".dragging");
        var targetTask = taskEl;
        if (draggingTask !== targetTask) {
            var rect = targetTask.getBoundingClientRect();
            var middleY = rect.top + rect.height / 2;
            if (e.clientY > middleY) {
                taskContainer.insertBefore(draggingTask, targetTask.nextSibling);
            }
            else {
                taskContainer.insertBefore(draggingTask, targetTask);
            }
        }
    });
    // Обработчик для сброса задачи в новый порядок
    taskEl.addEventListener("drop", function (e) {
        var _a;
        e.preventDefault();
        var taskId = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        if (taskId) {
            var movedTaskIndex = tasks.findIndex(function (task) { return task.id === taskId; });
            var targetIndex = tasks.findIndex(function (task) { return task.id === taskEl.dataset.id; });
            if (movedTaskIndex !== -1 && targetIndex !== -1 && movedTaskIndex !== targetIndex) {
                var movedTask = tasks.splice(movedTaskIndex, 1)[0];
                tasks.splice(targetIndex, 0, movedTask);
                saveTasks();
                renderTasks();
            }
        }
    });
    return taskEl;
}
function showDeletePopup(taskId) {
    var confirmDelete = confirm("Вы уверены, что хотите удалить эту задачу?");
    if (confirmDelete) {
        tasks = tasks.filter(function (task) { return task.id !== taskId; });
        saveTasks();
        renderTasks();
    }
}
function openDeletePopup(taskId) {
    var deletePopup = document.getElementById("delete-popup");
    deletePopup.classList.remove("hidden");
    // Устанавливаем обработчик для подтверждения удаления
    var confirmDeleteBtn = document.getElementById("confirm-delete");
    confirmDeleteBtn.onclick = function () { return confirmDeleteTask(taskId); };
    // Устанавливаем обработчик для отмены удаления
    var cancelDeleteBtn = document.getElementById("cancel-delete");
    cancelDeleteBtn.onclick = function () { return closeDeletePopup(); };
}
function closeDeletePopup() {
    var deletePopup = document.getElementById("delete-popup");
    deletePopup.classList.add("hidden");
}
function confirmDeleteTask(taskId) {
    tasks = tasks.filter(function (task) { return task.id !== taskId; }); // Удаляем задачу
    saveTasks(); // Сохраняем новый список задач
    renderTasks(); // Перерисовываем список задач
    closeDeletePopup(); // Закрываем попап
}
// script.ts
//function loginUser(telegramId: string, name: string, email: string) {
//  fetch('http://localhost:5000/api/user/login', {
//    method: 'POST',
//    headers: {
//      'Content-Type': 'application/json',
//    },
//    body: JSON.stringify({ telegramId, name, email }),
//  })
//    .then(response => response.json())
//    .then(data => {
//      if (data.message === 'User created') {
//        console.log('Новый пользователь создан:', data.user);
//        localStorage.setItem('user', JSON.stringify(data.user));
//      } else if (data.message === 'User already exists') {
//        console.log('Пользователь уже существует:', data.user);
//        localStorage.setItem('user', JSON.stringify(data.user));
//      }
//    })
//    .catch(error => {
//      console.error('Ошибка при входе:', error);
//    });
//}
//
//// Пример вызова функции при входе
//const telegramId = '12345';
//const user_name = 'John Doe';
//const email = 'john@example.com';
//loginUser(telegramId, user_name, email);
// Инициализация приложения
var currentTaskId = null;
// Функция для открытия попапа с предзаполнением значений
function openEditTaskPopup(task) {
    var _a;
    // Присваиваем ID задачи для использования позже
    currentTaskId = task.id;
    // Заполняем поля значениями текущей задачи
    document.getElementById('edit_task-name').value = task.name;
    document.getElementById('edit_task-description').value = task.description || '';
    document.getElementById('edit_task-importance').value = task.importance.toString();
    document.getElementById('edit_task-deadline').value = task.deadline || '';
    // Открываем попап
    (_a = document.getElementById('edit_popup')) === null || _a === void 0 ? void 0 : _a.classList.remove('hidden');
}
// Функция для сохранения изменений задачи
function saveTaskEdits() {
    if (currentTaskId === null)
        return;
    var task = tasks.find(function (t) { return t.id === currentTaskId; });
    if (task) {
        // Получаем обновленные значения из полей попапа
        task.name = document.getElementById('edit_task-name').value;
        task.description = document.getElementById('edit_task-description').value;
        task.importance = parseInt(document.getElementById('edit_task-importance').value);
        task.deadline = document.getElementById('edit_task-deadline').value;
        // Сохраняем задачи
        saveTasks();
        renderTasks();
        // Закрываем попап
        closeEditPopup();
    }
}
// Добавляем обработчики
(_a = document.getElementById('submit-edit-task')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', saveTaskEdits);
(_b = document.querySelector('.close-btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', closePopup);
(_c = document.querySelector('.close-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', closeEditPopup);
renderTasks();
