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

function closePopup() {
  popup.classList.add("hidden");
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
      <button class="delete-btn-sub"><i class="fas fa-trash"></i></button>
    </div>
  `;

  const subtaskContent = subtaskEl.querySelector(".subtask-content") as HTMLElement;
  const completeCheckbox = subtaskEl.querySelector(".complete-checkbox") as HTMLInputElement;
  const deleteButton = subtaskEl.querySelector(".delete-btn-sub") as HTMLElement;

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

// Рендеринг задач
function renderTasks() {
  taskContainer.innerHTML = "";
  tasks.forEach((task) => {
    taskContainer.appendChild(createTaskElement(task));
  });
}
// Завершить задачу

function markAsCompleted(task: Task) {
  task.state = "completed";
  saveTasks();
  renderTasks(); // Обновляем UI
}

function markAsCanceled(task: Task) {
  task.state = "canceled";
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
    <button class="add-subtask-btn">+</button>
    <div class="subtasks-container"></div>
  `;

  const subtasksContainer = taskEl.querySelector(".subtasks-container") as HTMLElement;

  // Отображаем все подзадачи
  task.subtasks.forEach((subtask) => {
    subtasksContainer.appendChild(createSubtaskElement(task, subtask));
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

  // Обработчик для начала перетаскивания
  taskEl.addEventListener("dragstart", (e) => {
    taskEl.classList.add("dragging");
    e.dataTransfer?.setData("text/plain", task.id);
  });

  // Обработчик для завершения перетаскивания
  taskEl.addEventListener("dragend", () => {
    taskEl.classList.remove("dragging");
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



// Инициализация приложения
renderTasks();
