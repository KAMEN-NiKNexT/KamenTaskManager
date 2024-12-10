interface Task {
    id: string;
    name: string;
    importance: number;
    description?: string;
    deadline?: string;
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
      state: "default",
    };
  
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closePopup();
  });
  
  // Сохранение задач в localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  // Рендеринг задач
  function renderTasks() {
    taskContainer.innerHTML = "";
    tasks.forEach((task) => taskContainer.appendChild(createTaskElement(task)));
  }
  
  // Создание элемента задачи
  function createTaskElement(task: Task): HTMLElement {
    const taskEl = document.createElement("div");
    taskEl.className = `task ${task.state}`;
    taskEl.innerHTML = `
      <div>
        <strong>${task.name}</strong> (Importance: ${task.importance})
      </div>
      <div>${task.description || ""}</div>
      <div>${task.deadline || ""}</div>
    `;
  
    // Свайп вправо — завершить задачу
    taskEl.addEventListener("swiperight", () => {
      task.state = "completed";
      saveTasks();
      renderTasks();
    });
  
    // Свайп влево — отменить задачу
    taskEl.addEventListener("swipeleft", () => {
      task.state = "canceled";
      saveTasks();
      renderTasks();
    });
  
    return taskEl;
  }
  
  // Инициализация приложения
  renderTasks();
  