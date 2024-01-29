const key = "b01a9589c7544c16b3f465068baca374";
const apiUrl = `https://crudcrud.com/api/${key}/tasks`;

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const eraseBtn = document.querySelector("#erase-button");
const resetBtn = document.querySelector("#reset-button");

let oldInputValue;

const saveTodoToApi = async (todo) => {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });

    if (!response.ok) {
      throw new Error('Failed to save todo');
    }

    const result = await response.json();
    console.log('Todo saved successfully:', result);
  } catch (error) {
    console.error('Error saving todo:', error);
  }
};

const updateTodoFromApi = async (newText, oldText) => {
  try {
    const todoElements = document.querySelectorAll('.todo');
var h4Value = "";
// Itere sobre os elementos .todo
todoElements.forEach((todoElement) => {
  // Selecione o elemento h3 dentro de .todo
  const h3Element = todoElement.querySelector('h3');
console.log(h3Element.innerText.trim())
console.log(newText);
  // Verifique se o elemento h3 foi encontrado e seu texto corresponde ao searchText
  if (h3Element && h3Element.innerText.includes(newText)) {
    // Se o texto de h3 corresponder, selecione e imprima o valor de h4
    const h4Element = todoElement.querySelector('h4');
    if (h4Element) {
        
       h4Value = h4Element.innerText.split(' ')[1];;
      console.log(h4Value);
    }
  }
});
    //const todoToUpdate = document.querySelector(`.todo h3:contains("${oldText}")`);
    //const taskId = todoToUpdate.parentElement.dataset.id;

    const updateUrl = `${apiUrl}/${h4Value}`;
    console.log(updateUrl);
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: oldText }),
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }

    console.log('Todo updated successfully');
    h4Value.innerText = `${taskId}- ${newText}`;
    
  } catch (error) {
    
    console.error('Error updating todo:', error);
    location.reload();
  }
};

const removeTodoFromApi = async (taskId) => {
  try {
    const response = await fetch(`${apiUrl}/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
  } catch (error) {
    console.error('Error removing todo:', error);
  }
};

const loadTodosFromApi = async () => {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to load todos');
    }

    const todos = await response.json();
    
    
    
    todos.forEach((todo) => {
      saveTodo(todo.text, todo.done, 0, todo.id, todo._id);
    });

    console.log('Todos loaded successfully');
  } catch (error) {
    console.error('Error loading todos:', error);
  }
};

const saveTodo = async (text, done = 0, save = 1, id = null, _id) => {
    const todo = document.createElement("div");
    todo.classList.add("todo");
    const taskId = id ;
    resetBtn.classList.remove("hide");
  
    todo.dataset.id = taskId;
  
    const todoTitle = document.createElement("h3");
    todoTitle.innerText = `${text}`;
    todo.appendChild(todoTitle);
  
    const todoId = document.createElement("h4");
    todoId.innerText = `${taskId}- ${_id}`;
    todoId.style.display = 'none';
    todo.appendChild(todoId);
  
    const doneBtn = document.createElement("button");
    doneBtn.classList.add("finish-todo");
    doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    todo.appendChild(doneBtn);
  
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-todo");
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    todo.appendChild(editBtn);
  
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("remove-todo");
    deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    todo.appendChild(deleteBtn);
  
    if (done) {
      todo.classList.add("done");
    }
  
    if (save) {
      saveTodoToApi({ id: taskId, text, done: 0 });
    }
  
    editBtn.addEventListener("click", (e) => {
      
      editInput.value = text;
      oldInputValue = text;
    });
  
    todoList.appendChild(todo);
  
    todoInput.value = "";
  };

resetBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await resetAllTasks();
});

const resetAllTasks = async () => {
  todoList.innerHTML = "";
  await resetTodosApi();
  taskIdCounter = 0;
  resetBtn.classList.add("hide");
};

const resetTodosApi = async () => {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to reset todos');
    }

    const todos = await response.json();

    todos.forEach(async (todo) => {
      await removeTodoFromApi(todo._id);
    });

    console.log('Todos reset successfully');
  } catch (error) {
    console.error('Error resetting todos:', error);
  }
};

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputValue = todoInput.value;

  if (inputValue) {
    await saveTodo(inputValue);
  }
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const editedValue = editInput.value;

  if (editedValue) {
    await updateTodoFromApi(oldInputValue, editedValue);
    
    oldInputValue = null;
  }
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  
  oldInputValue = null;
});

document.addEventListener("click", async (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest("div");
  const todoElement = targetEl.closest(".todo");
  if (!todoElement) {
    return; 
  }
  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    hideEditForm();
  });
  
  let todoTitle;
  const hiddenTitleElement = todoElement.querySelector("h4");
  const hiddenTitle = hiddenTitleElement.innerText.split(' ')[1];

  if (parentEl && parentEl.querySelector("h4")) {
    todoTitle = parentEl.querySelector("h4").innerText || "";
  }

  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done");

    await updateTodoStatusToApi(hiddenTitle);
  }

  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove();

    await removeTodoFromApi(hiddenTitle);
  }

  if (targetEl.classList.contains("edit-todo")) {
    showEditForm();

    editInput.value = todoTitle;
    oldInputValue = todoTitle;

    const todoTitle = todoElement.querySelector("h3").innerText;
    editInput.value = todoTitle;

    currentTodoElement = todoElement;
  }
});

function showEditForm() {
    const editForm = document.getElementById("edit-form");
    editForm.classList.remove("hide");
  }

  function hideEditForm() {
    const editForm = document.getElementById("edit-form");
    editForm.classList.add("hide");
  }

  
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const editInputValue = editInput.value;
  
    hideEditForm();
    
  });

function atualizarRelogio() {
  const agora = new Date();
  const horas = agora.getHours();
  const minutos = agora.getMinutes();

  const horasFormatadas = horas < 10 ? '0' + horas : horas;
  const minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
  const relogio = `${horasFormatadas}:${minutosFormatados}`;
  document.getElementById('relogio').innerText = relogio;
}
atualizarRelogio();
setInterval(atualizarRelogio, 60000);

loadTodosFromApi();
