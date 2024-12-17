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
  state: "default" | "completed" | "canceled";
  category: string;  // Новое поле для категории
  subtasks: Subtask[];
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
  createTask(e);
});
// Функция создания задачи
function createTask(event: Event) {
  event.preventDefault();

  const taskName = (document.querySelector("#task-name") as HTMLInputElement).value;
  const taskImportance = parseInt((document.querySelector("#task-importance") as HTMLInputElement).value);
  const taskDescription = (document.querySelector("#task-description") as HTMLTextAreaElement).value;
  const taskDeadline = (document.querySelector("#task-deadline") as HTMLInputElement).value;
  const taskCategory = (document.querySelector("#task-category") as HTMLSelectElement).value;

  // Создаём новую задачу
  const newTask: Task = {
    id: crypto.randomUUID(),
    name: taskName,
    importance: taskImportance,
    description: taskDescription,
    deadline: taskDeadline,
    state: "default",
    category: taskCategory,  // Категория задачи
    subtasks: []
  };

  tasks.push(newTask); // Добавляем задачу в массив задач
  saveTasks();  // Сохраняем задачи
  renderTasks();  // Перерисовываем задачи

  closePopup(); // Закрываем попап
}


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
let startY: number;
let scrollTop: number;
let blockClick = false; // Флаг для блокировки кликов во время перетаскивания

// Отключаем выделение текста
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const startEvent = isTouchDevice ? 'touchstart' : 'mousedown';
const moveEvent = isTouchDevice ? 'touchmove' : 'mousemove';
const endEvent = isTouchDevice ? 'touchend' : 'mouseup';
const cancelEvent = isTouchDevice ? 'touchcancel' : 'mouseleave'; 

// Начало перетаскивания
tabsContainer.addEventListener(startEvent, (e: MouseEvent | TouchEvent) => {
  let pageY: number;

  if (isTouchDevice) {
    // Приводим событие к типу TouchEvent, чтобы получить e.touches
    pageY = (e as TouchEvent).touches[0].pageY;
  } else {
    // Приводим событие к типу MouseEvent для обработки e.pageY
    pageY = (e as MouseEvent).pageY;
  }

  isDragging = true;
  startY = pageY - tabsContainer.offsetTop; // Начальная позиция по вертикали
  scrollTop = tabsContainer.scrollTop; // Текущая прокрутка
  tabsContainer.style.cursor = 'grabbing'; // Курсор меняется на "схватить"

  // Только если началось перетаскивание, блокируем клики
  blockClick = false;
  setTimeout(() => {
    if (isDragging) {
      blockClick = true; // Блокируем клики, если это был drag
    }
  }, 100); // Задержка, чтобы пользователь мог кликнуть по кнопке до того как начнется перетаскивание
});

// Выход из области перетаскивания
tabsContainer.addEventListener(cancelEvent, () => {
  isDragging = false;
  tabsContainer.style.cursor = 'grab'; // Курсор меняется обратно на "схватить"
  blockClick = false; // Разблокируем клики
});
// Завершение перетаскивания
tabsContainer.addEventListener(endEvent, () => {
  isDragging = false;
  tabsContainer.style.cursor = 'grab'; // Курсор меняется обратно на "схватить"
  setTimeout(() => {
    blockClick = false; // Разблокируем клики через небольшую задержку (150 мс)
  }, 100); // 150 миллисекунд
});

// Перетаскивание
tabsContainer.addEventListener(moveEvent, (e: MouseEvent | TouchEvent) => {
  if (!isDragging) return; // Если не перетаскиваем, ничего не делаем
  e.preventDefault(); // Останавливаем стандартный скроллинг

  let pageY: number;

  if (isTouchDevice) {
    // Приводим событие к типу TouchEvent, чтобы получить e.touches
    pageY = (e as TouchEvent).touches[0].pageY;
  } else {
    // Приводим событие к типу MouseEvent для обработки e.pageY
    pageY = (e as MouseEvent).pageY;
  }

  const y = pageY - tabsContainer.offsetTop; // Текущая позиция мыши по вертикали
  const walk = (y - startY); // Скорость прокрутки
  tabsContainer.scrollTop = scrollTop - walk; 
});


const categoryFilter = document.querySelector("#category-filter") as HTMLSelectElement;

let currentStateFilter: string = "all"; // Глобальная переменная для хранения текущего фильтра состояния
let currentCategoryFilter: string = "all"; // Глобальная переменная для хранения текущего фильтра категории

// Обработчик для фильтра по состоянию задачи
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (!blockClick) { // Проверяем, не в состоянии перетаскивания ли мы
      tabs.forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');
      currentStateFilter = tab.getAttribute('data-tab') || "all"; // Обновляем фильтр состояния
      renderTasks(); // Перерисовываем задачи с учетом нового фильтра
    }
  });
});

// Обработчик для фильтра по категориям
categoryFilter.addEventListener('change', () => {
  currentCategoryFilter = categoryFilter.value; // Обновляем фильтр категории
  renderTasks(); // Перерисовываем задачи с учетом нового фильтра
});

function renderTasks() {
  taskContainer.innerHTML = ""; // Очищаем контейнер

  // Фильтрация задач по состоянию и категории
  const filteredTasks = tasks.filter(task => {
    // Фильтрация по состоянию задачи
    const stateFilter = (currentStateFilter === "all" || task.state === currentStateFilter);
    
    // Фильтрация по категории задачи
    const categoryFilter = (currentCategoryFilter === "all" || task.category === currentCategoryFilter);

    return stateFilter && categoryFilter;
  });

  // Отображаем отфильтрованные задачи
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
  <div class="task-card">
    <div class="task-header">
      <strong>${task.name}</strong>
      <span class="task-importance">⭐ ${task.importance}</span>
    </div>
    <div class="task-additional-info">
      <div class="task-category">${task.category}</div>
      <span class="task-deadline">${task.deadline || ""}</span>
    </div>
    <p class="task-description">${task.description || ""}</p>
    <div class="subtasks-container"></div>
    <div class="task-actions"></div>
    <div class="task-footer">
      <div class="task-buttons">
        <button class="edit-btn-task" title="Edit Task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="add-subtask-btn" title="Add Subtask">+</button>
      </div>
    </div>
  </div>
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

  const footerButtonsContainer = taskEl.querySelector(".task-actions") as HTMLElement;

  // Добавляем новые кнопки "Выполнено", "Отменить" и "Удалить" внутрь
  const completeButton = document.createElement("button");
  completeButton.classList.add("complete-btn");
  completeButton.textContent = "Выполнено";
  completeButton.title = "Mark as Complete";
  footerButtonsContainer.appendChild(completeButton);

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("cancel-btn");
  cancelButton.textContent = "Отменить";
  cancelButton.title = "Cancel Task";
  footerButtonsContainer.appendChild(cancelButton);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.innerHTML = `<i class="fas fa-trash"></i>`; // Иконка мусорки
  deleteButton.title = "Delete Task";
  const deleteContainer = taskEl.querySelector(".task-buttons") as HTMLElement;
  deleteContainer.appendChild(deleteButton);

  // Обработчики кнопок
  completeButton.addEventListener("click", () => {
    const taskToComplete = tasks.find((t) => t.id === task.id);
    if (taskToComplete) {
      markAsCompleted(taskToComplete);
    }
  });

  // Обработчик кнопки "Отменить"
  cancelButton.addEventListener("click", () => {
    const taskToCancel = tasks.find((t) => t.id === task.id);
    if (taskToCancel) {
      markAsCanceled(taskToCancel);
    }
  });

  // Обработчик кнопки "Удалить"
  deleteButton.addEventListener("click", () => {
    openDeletePopup(task.id);
  });

  // Если задача выполнена, скрыть кнопку удаления
  if (task.state === "completed") {
    deleteButton.classList.add("hidden");
  }

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
  (document.getElementById('edit_task-category') as HTMLSelectElement).value = task.category || 'none';
  
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
    task.category = (document.getElementById('edit_task-category') as HTMLSelectElement).value;

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
