const STORAGE_KEYS = {
  TODOS: 'todo:list:v1',
  DRAFT: 'todo:draft:v1',
};

const contentsEl = document.querySelector('.contents');
const formEl = document.querySelector('.form');
const textareaEl = document.getElementById('todo-input');
const addBtnEl = document.querySelector('.add');
const clearAllBtn = document.querySelector('.clear-all');

let todos = [];

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (e) {
    console.warn('Failed to save todos:', e);
  }
}
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveDraft(value) {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFT, value ?? '');
  } catch (e) {
    console.warn('Failed to save draft:', e);
  }
}
function loadDraft() {
  try {
    return localStorage.getItem(STORAGE_KEYS.DRAFT) || '';
  } catch {
    return '';
  }
}

function render() {
  contentsEl.innerHTML = '';
  todos.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = 'todo' + (t.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = t.completed;
    checkbox.setAttribute('aria-label', 'Mark todo as completed');

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = t.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.setAttribute('aria-label', 'Delete todo');
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 3h6a1 1 0 0 1 1 1v1h4v2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4V5h4V4a1 1 0 0 1 1-1Zm1 2v0h4V5h-4Zm-3 4v10h10V9H7Zm3 2h2v6H10v-6Zm4 0h2v6h-2v-6Z"/>
      </svg>
    `;

    checkbox.addEventListener('change', () => {
      todos[idx].completed = checkbox.checked;
      saveTodos();
      li.classList.toggle('completed', checkbox.checked);
    });

    delBtn.addEventListener('click', () => {
      todos.splice(idx, 1);
      saveTodos();
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    contentsEl.appendChild(li);
  });
}

function addTodoFromInput() {
  const value = textareaEl.value.trim();
  if (!value) return;

  todos.push({ text: value, completed: false });
  saveTodos();
  render();

  textareaEl.value = '';
  saveDraft('');
  textareaEl.focus();
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodoFromInput();
});

textareaEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    addTodoFromInput();
  }
});

let draftTimer = null;
textareaEl.addEventListener('input', () => {
  clearTimeout(draftTimer);
  const val = textareaEl.value;
  draftTimer = setTimeout(() => saveDraft(val), 300);
});

clearAllBtn.addEventListener('click', () => {
  if (todos.length === 0) return;
  const ok = confirm('すべてのTodoを削除しますか？');
  if (!ok) return;
  todos = [];
  saveTodos();
  render();
});

window.addEventListener('beforeunload', () => {
  saveTodos();
  saveDraft(textareaEl.value);
});

(function init() {
  todos = loadTodos();
  render();
  const draft = loadDraft();
  if (draft) textareaEl.value = draft;
})();

let typing = false;

textareaEl.addEventListener('input', () => {
  typing = textareaEl.value.trim().length > 0;
});

window.addEventListener('beforeunload', (e) => {
  if (typing) {
    e.preventDefault();
    e.returnValue = ''; // Chrome系はこれが必要
  }
});
