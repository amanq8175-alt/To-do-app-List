// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const allFilterBtn = document.getElementById('allFilter');
const activeFilterBtn = document.getElementById('activeFilter');
const completedFilterBtn = document.getElementById('completedFilter');

// Filter state & Tasks
let currentFilter = 'all';
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function init() {
    renderTasks();
    updateStats();
    
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    allFilterBtn.addEventListener('click', () => setFilter('all'));
    activeFilterBtn.addEventListener('click', () => setFilter('active'));
    completedFilterBtn.addEventListener('click', () => setFilter('completed'));
    
    document.querySelector('.add-task-container').style.animation = 'slideIn 0.8s ease-out';
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;
    
    const newTask = {
        id: Date.now(),
        text,
        completed: false,
        timestamp: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    
    taskInput.value = '';
    taskInput.focus();
}

function toggleTask(id) {
    tasks = tasks.map(task => task.id === id ? {...task, completed: !task.completed} : task);
    saveTasks();
    renderTasks();
    updateStats();
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        taskElement.style.transform = 'translateX(100px) scale(0.8)';
        taskElement.style.opacity = '0';
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
        }, 300);
    }
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateStats();
}

function setFilter(filter) {
    currentFilter = filter;
    [allFilterBtn, activeFilterBtn, completedFilterBtn].forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-r', 'from-primary', 'to-darkpurple', 'text-white');
        btn.classList.add('bg-lightpurple', 'text-darkpurple');
    });
    
    const activeBtn = filter === 'all' ? allFilterBtn : filter === 'active' ? activeFilterBtn : completedFilterBtn;
    activeBtn.classList.add('active', 'bg-gradient-to-r', 'from-primary', 'to-darkpurple', 'text-white');
    
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = total - completed;
    
    total === 0 ? emptyState.classList.remove('hidden') : emptyState.classList.add('hidden');
}

function renderTasks() {
    let filteredTasks = tasks;
    if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    else if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        if (tasks.length === 0) emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    taskList.innerHTML = filteredTasks.map((task, index) => `
        <div class="task-item bg-white rounded-xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-all task-card" data-id="${task.id}" style="animation-delay: ${index * 0.05}s;">
            <div class="relative flex-shrink-0 mt-1">
                <div class="checkmark w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-darkpurple flex items-center justify-center cursor-pointer ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="task-text text-base md:text-lg ${task.completed ? 'completed-text' : 'text-gray-800'} break-words font-medium">${task.text}</p>
                <p class="task-meta text-[0.65rem] md:text-xs text-gray-500 mt-1">Added: ${new Date(task.timestamp).toLocaleDateString()}</p>
            </div>
            <button class="delete-btn text-red-500 hover:text-red-700 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-red-100 transition-all" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash text-[0.6rem] md:text-xs"></i>
            </button>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);