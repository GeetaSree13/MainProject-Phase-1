const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');

let completedTasks = 0;
let totalTasks = 0;

addBtn.addEventListener('click', () => {
  const todoText = todoInput.value.trim();
  if (todoText) {
    addTodoItem(todoText);
    todoInput.value = '';
  }
});

function addTodoItem(text) {
  totalTasks++;
  updateStats();

  const todoItem = document.createElement('li');
  todoItem.classList.add('todo-item');

  const todoText = document.createElement('span');
  todoText.textContent = text;

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');

  const completeBtn = document.createElement('button');
  completeBtn.classList.add('complete-btn');
  completeBtn.innerHTML = 'Done';
  completeBtn.addEventListener('click', () => {
    todoItem.classList.toggle('completed');
    if (todoItem.classList.contains('completed')) {
      completedTasks++;
    } else {
      completedTasks--;
    }
    updateStats();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerHTML = 'Remove';
  deleteBtn.addEventListener('click', () => {
    if (todoItem.classList.contains('completed')) {
      completedTasks--;
    }
    totalTasks--;
    todoList.removeChild(todoItem);
    updateStats();
  });

  buttonGroup.appendChild(completeBtn);
  buttonGroup.appendChild(deleteBtn);
  todoItem.appendChild(todoText);
  todoItem.appendChild(buttonGroup);
  todoList.appendChild(todoItem);
}

function updateStats() {
  completedCount.textContent = completedTasks;
  totalCount.textContent = totalTasks;
}
