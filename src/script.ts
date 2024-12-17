interface Subtask {
  id: string; 
  name: string; 
  state: string
}

interface Task {
  id: string;
  name: string;
  importance: number;
  description?: string;
  deadline?: string;
  subtasks: Subtask[];
  state: "default" | "completed" | "canceled";
}

const taskContainer = document.getElementById("task-container")!;
const addTaskBtn = document.getElementById("add-task-btn")!;
const popup = document.getElementById("popup")!;
const closePopupBtn = document.getElementById("close-popup-btn")!;
const form = document.getElementById("task-form") as HTMLFormElement;

let tasks: Task[] = JSON.parse(localStorage.getItem("tasks") || "[]");

// Показать popup
addTaskBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

// Закрыть popup
closePopupBtn.addEventListener("click", () => {
  closePopup();
});

// Функция для закрытия попапа
function closePopup() {
  document.getElementById('popup')?.classList.add('hidden');
  currentTaskId = null; // Сброс ID задачи
  form.reset();
}
function closeEditPopup() {
  document.getElementById('edit_popup')?.classList.add('hidden');
  currentTaskId = null; // Сброс ID задачи
  form.reset();
}

// Добавление задачи
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = (document.getElementById("task-name") as HTMLInputElement).value.trim();
  const importance = parseInt((document.getElementById("task-importance") as HTMLInputElement).value, 10);
  const description = (document.getElementById("task-description") as HTMLTextAreaElement).value.trim();
  const deadline = (document.getElementById("task-deadline") as HTMLInputElement).value;

  if (!name || isNaN(importance) || importance < 1 || importance > 5) {
    alert("Please fill out all required fields correctly.");
    return;
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    name,
    importance,
    description,
    deadline,
    subtasks: [],
    state: "default",
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  closePopup();
});

function addSubtask(task: Task, subtaskName: string) {
  const newSubtask: Subtask = {
    id: generateUniqueId(), // Уникальный идентификатор подзадачи
    name: subtaskName,
    state: "pending",
  };

  task.subtasks.push(newSubtask);
  saveTasks();
}
function removeSubtask(task: Task, subtaskId: string) {
  task.subtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
  saveTasks();
  renderTasks();
}
function markSubtaskAsCompleted(task: Task, subtaskId: string) {
  const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
  if (subtask) {
    subtask.state = "completed";
    saveTasks();
    renderTasks();
  }
}
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9); // Генерирует случайный ID
}
function createSubtaskElement(task: Task, subtask: Subtask): HTMLElement {
  const subtaskEl = document.createElement("div");
  subtaskEl.className = `subtask ${subtask.state}`;

  // Создаём HTML-разметку для подзадачи
  subtaskEl.innerHTML = `
    <div class="subtask-content">${subtask.name}</div>
    <div class="subtask-actions">
      <input type="checkbox" class="complete-checkbox" ${subtask.state === "completed" ? "checked" : ""} />
      <button class="edit-btn-sub"><i class="fas fa-edit"></i></button>
      <button class="delete-btn-sub"><i class="fas fa-trash"></i></button>
    </div>
  `;

  const subtaskContent = subtaskEl.querySelector(".subtask-content") as HTMLElement;
  const completeCheckbox = subtaskEl.querySelector(".complete-checkbox") as HTMLInputElement;
  const editButton = subtaskEl.querySelector(".edit-btn-sub") as HTMLButtonElement;
  const deleteButton = subtaskEl.querySelector(".delete-btn-sub") as HTMLButtonElement;

  // Обработчик для кнопки редактирования
  editButton.addEventListener("click", () => {
    const newSubtaskName = prompt("Введите новое название подзадачи:", subtask.name);
    if (newSubtaskName && newSubtaskName.trim() !== "") {
      subtask.name = newSubtaskName.trim();
      subtaskContent.textContent = newSubtaskName.trim(); // Обновляем текст подзадачи
      saveTasks();
      renderTasks();
    }
  });

  // Обработчик для чекбокса "Выполнено"
  completeCheckbox.addEventListener("change", () => {
    if (completeCheckbox.checked) {
      subtask.state = "completed";
      subtaskContent.style.textDecoration = "line-through";
      subtaskContent.style.opacity = "0.5"; // Сделать текст полупрозрачным
    } else {
      subtask.state = "active";
      subtaskContent.style.textDecoration = "none";
      subtaskContent.style.opacity = "1"; // Сделать текст непрозрачным
    }
    saveTasks();
    renderTasks();
  });

  // Обработчик для кнопки "Удалить"
  deleteButton.addEventListener("click", () => {
    const index = task.subtasks.indexOf(subtask);
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

const tabsContainer = document.querySelector('.tabs-container') as HTMLElement;
let isDragging = false;
let startX: number;
let scrollLeft: number;

tabsContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX - tabsContainer.offsetLeft;
  scrollLeft = tabsContainer.scrollLeft;
  tabsContainer.style.cursor = 'grabbing'; // Курсор меняется на "схватить"
});

tabsContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  tabsContainer.style.cursor = 'grab'; // Курсор меняется обратно на "схватить"
});

tabsContainer.addEventListener('mouseup', () => {
  isDragging = false;
  tabsContainer.style.cursor = 'grab'; // Курсор меняется обратно на "схватить"
});

tabsContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return; // Если не перетаскиваем, ничего не делаем
  e.preventDefault(); // Останавливаем стандартный скроллинг
  const x = e.pageX - tabsContainer.offsetLeft; // Текущая позиция мыши
  const walk = (x - startX) * 2; // Скорость прокрутки
  tabsContainer.scrollLeft = scrollLeft - walk; // Прокручиваем влево/вправ
});


const tabs = document.querySelectorAll('.tab');
let currentFilter: string = "all"; // Глобальная переменная для хранения текущего фильтра

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Убираем активный класс у всех табов
    tabs.forEach(t => t.classList.remove('active-tab'));
    tab.classList.add('active-tab');

    // Обновляем текущий фильтр из атрибута data-tab
    currentFilter = tab.getAttribute('data-tab') || "all";

    // Перерисовываем задачи
    renderTasks();
  });
});

function renderTasks() {
  taskContainer.innerHTML = ""; // Очищаем контейнер

  const filteredTasks = tasks.filter(task => {
    switch (currentFilter) {
      case "active":
        return task.state === "default";
      case "completed":
        return task.state === "completed";
      case "canceled":
        return task.state === "canceled";
      default:
        return true; // По умолчанию возвращаем все задачи
    }
  });

  filteredTasks.forEach(task => {
    taskContainer.appendChild(createTaskElement(task));
  });
}

// Завершить задачу

function markAsCompleted(task: Task) {
  if (task.state == "completed") task.state = "default";
  else task.state = "completed";
  saveTasks();
  renderTasks(); // Обновляем UI
}

function markAsCanceled(task: Task) {
  if (task.state == "canceled") task.state = "default";
  else task.state = "canceled";
  saveTasks();
  renderTasks(); // Обновляем UI
}


// Создание элемента задачи
function createTaskElement(task: Task): HTMLElement {
  const taskEl = document.createElement("div");
  taskEl.className = `task ${task.state}`;
  taskEl.draggable = true;

  taskEl.innerHTML = `
    <div>
      <strong>${task.name}</strong> (Importance: ${task.importance})
    </div>
    <div>${task.description || ""}</div>
    <div>${task.deadline || ""}</div>
    <button class="edit-btn-task"><i class="fas fa-edit"></i></button> <!-- Кнопка редактирования задачи -->
    <button class="add-subtask-btn">+</button>
    <div class="subtasks-container"></div>
  `;

  const subtasksContainer = taskEl.querySelector(".subtasks-container") as HTMLElement;
  const editButton = taskEl.querySelector('.edit-btn-task') as HTMLButtonElement;

  // Обработчик кнопки редактирования задачи
  editButton.addEventListener('click', () => {
    openEditTaskPopup(task);
  });

  // Отображаем все подзадачи
  task.subtasks.forEach((subtask) => {
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

  taskEl.addEventListener("dragstart", (e) => {
    taskEl.classList.add("dragging");
    e.dataTransfer?.setData("text/plain", task.id);
  });

  // Обработчик для завершения перетаскивания
  taskEl.addEventListener("dragend", () => {
    taskEl.classList.remove("dragging");
  });

  // Обработчик кнопки добавления подзадачи
  const addSubtaskButton = taskEl.querySelector(".add-subtask-btn") as HTMLElement;
  addSubtaskButton.addEventListener("click", () => {
    const newSubtaskName = prompt("Введите название подзадачи:");
    if (newSubtaskName) {
      addSubtask(task, newSubtaskName);
      // После добавления подзадачи обновим отображение
      renderTasks();
    }
  });

  // Добавляем кнопки "Выполнено", "Отменить" и "Удалить"
  const buttons = document.createElement("div");
  buttons.className = "task-buttons";
  buttons.innerHTML = `
    <button class="complete-btn">Выполнено</button>
    <button class="cancel-btn">Отменить</button>
    <button class="delete-btn">
      <i class="fas fa-trash"></i> <!-- Иконка мусорки -->
    </button>`;

  // Обработчик кнопки "Выполнено"
  buttons.querySelector(".complete-btn")?.addEventListener("click", () => {
    const taskToComplete = tasks.find((t) => t.id === task.id);
    if (taskToComplete) {
      markAsCompleted(taskToComplete);
    }
  });

  // Обработчик кнопки "Отменить"
  buttons.querySelector(".cancel-btn")?.addEventListener("click", () => {
    const taskToCancel = tasks.find((t) => t.id === task.id);
    if (taskToCancel) {
      markAsCanceled(taskToCancel);
    }
  });

  // Обработчик кнопки "Удалить"
  buttons.querySelector(".delete-btn")?.addEventListener("click", () => {
    openDeletePopup(task.id);
  });

  // Если задача выполнена, скрыть кнопку удаления
  if (task.state === "completed") {
    buttons.querySelector(".delete-btn")?.classList.add("hidden");
  }

  taskEl.appendChild(buttons);

  // Сохраняем ID задачи, чтобы можно было получить доступ к элементу при перерисовке
  taskEl.dataset.id = task.id;

  // Обработчик для перетаскивания задачи в контейнере
  taskEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingTask = document.querySelector(".dragging") as HTMLElement;
    const targetTask = taskEl as HTMLElement;
    if (draggingTask !== targetTask) {
      const rect = targetTask.getBoundingClientRect();
      const middleY = rect.top + rect.height / 2;
      if (e.clientY > middleY) {
        taskContainer.insertBefore(draggingTask, targetTask.nextSibling);
      } else {
        taskContainer.insertBefore(draggingTask, targetTask);
      }
    }
  });

  // Обработчик для сброса задачи в новый порядок
  taskEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer?.getData("text/plain");
    if (taskId) {
      const movedTaskIndex = tasks.findIndex((task) => task.id === taskId);
      const targetIndex = tasks.findIndex((task) => task.id === taskEl.dataset.id);

      if (movedTaskIndex !== -1 && targetIndex !== -1 && movedTaskIndex !== targetIndex) {
        const [movedTask] = tasks.splice(movedTaskIndex, 1);
        tasks.splice(targetIndex, 0, movedTask);
        saveTasks();
        renderTasks();
      }
    }
  });

  return taskEl;
}



function showDeletePopup(taskId: string) {
  const confirmDelete = confirm("Вы уверены, что хотите удалить эту задачу?");
  if (confirmDelete) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
  }
}

function openDeletePopup(taskId: string) {
  const deletePopup = document.getElementById("delete-popup")!;
  deletePopup.classList.remove("hidden");

  // Устанавливаем обработчик для подтверждения удаления
  const confirmDeleteBtn = document.getElementById("confirm-delete")!;
  confirmDeleteBtn.onclick = () => confirmDeleteTask(taskId);

  // Устанавливаем обработчик для отмены удаления
  const cancelDeleteBtn = document.getElementById("cancel-delete")!;
  cancelDeleteBtn.onclick = () => closeDeletePopup();
}
function closeDeletePopup() {
  const deletePopup = document.getElementById("delete-popup")!;
  deletePopup.classList.add("hidden");
}
function confirmDeleteTask(taskId: string) {
  tasks = tasks.filter((task) => task.id !== taskId); // Удаляем задачу
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

let currentTaskId: string | null = null;

// Функция для открытия попапа с предзаполнением значений
function openEditTaskPopup(task: Task) {
  // Присваиваем ID задачи для использования позже
  currentTaskId = task.id;
  
  // Заполняем поля значениями текущей задачи
  (document.getElementById('edit_task-name') as HTMLInputElement).value = task.name;
  (document.getElementById('edit_task-description') as HTMLTextAreaElement).value = task.description || '';
  (document.getElementById('edit_task-importance') as HTMLInputElement).value = task.importance.toString();
  (document.getElementById('edit_task-deadline') as HTMLInputElement).value = task.deadline || '';
  
  // Открываем попап
  document.getElementById('edit_popup')?.classList.remove('hidden');
}



// Функция для сохранения изменений задачи
function saveTaskEdits() {
  if (currentTaskId === null) return;

  const task = tasks.find((t) => t.id === currentTaskId);
  if (task) {
    // Получаем обновленные значения из полей попапа
    task.name = (document.getElementById('edit_task-name') as HTMLInputElement).value;
    task.description = (document.getElementById('edit_task-description') as HTMLTextAreaElement).value;
    task.importance = parseInt((document.getElementById('edit_task-importance') as HTMLInputElement).value);
    task.deadline = (document.getElementById('edit_task-deadline') as HTMLInputElement).value;

    // Сохраняем задачи
    saveTasks();
    renderTasks();

    // Закрываем попап
    closeEditPopup();
  }
}

// Добавляем обработчики
document.getElementById('submit-edit-task')?.addEventListener('click', saveTaskEdits);
document.querySelector('.close-btn')?.addEventListener('click', closePopup);
document.querySelector('.close-btn')?.addEventListener('click', closeEditPopup);

renderTasks();
