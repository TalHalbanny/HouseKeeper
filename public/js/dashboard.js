
let allTasks = [];
let currentPage = 1;
const tasksPerPage = 3;

//on dashboard page load, add username to navbar & get tasks data from nodejs API route.

document.addEventListener('DOMContentLoaded', async () => {
    
    const house_name = localStorage.getItem('householdName');
    const houseId = localStorage.getItem('household_id');
    const displayNameElem = document.getElementById('display_name');
    const tasksContainer = document.getElementById('tasks_container');

    if (house_name && displayNameElem) {
        displayNameElem.innerText = house_name;
    }

    if (!houseId || !house_name) {
        window.location.href = '/'; 
        return;
    }

    try {
        const response = await fetch(`/api/get_tasks/${houseId}`);

        const result = await response.json();

        if (result.success && result.tasks.length > 0) {
            allTasks = result.tasks; 
            console.log("Tasks loaded successfully:", allTasks.length); 
            displayTasksByPage(1); 
        } else {
            tasksContainer.innerHTML = '<p class="text-slate-400 text-center col-span-full py-10 font-medium">No tasks found. Start by adding one!</p>';
            updatePaginationButtons(); 
        }
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    }
});

//display tasks and pagination logic. 

function displayTasksByPage(page) {
    
    currentPage = page;
    const startIndex = (page - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const tasksToShow = allTasks.slice(startIndex, endIndex);

    renderTasks(tasksToShow);
    updatePaginationButtons();
}

//render tasks as cards and insert into pagination.

function renderTasks(tasks) {

    const tasksContainer = document.getElementById('tasks_container');
    tasksContainer.innerHTML = ''; 

    tasks.forEach(task => {
        const priorityColor = {
            'high': 'bg-red-100 text-red-700 border-red-200',
            'medium': 'bg-orange-100 text-orange-700 border-orange-200',
            'low': 'bg-blue-100 text-blue-700 border-blue-200'
        }[task.task_argentcy] || 'bg-slate-100 text-slate-700';

        const card = `
            <div class="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 transition-all hover:scale-[1.02] relative group">
                <div class="flex justify-between items-center mb-4">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityColor}">
                        ${task.task_argentcy}
                    </span>
                    <button onclick="completeTask(event,'${task.id}')" 
                        class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-100 text-slate-300 hover:border-green-500 hover:text-green-500 hover:bg-green-50 transition-all duration-300 shadow-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2 text-left">${task.task_headline}</h3>
                <p class="text-slate-600 leading-relaxed text-sm text-left">${task.task_body || 'No description provided'}</p>
                <div class="mt-6 pt-4 border-t border-gray-50 flex items-center text-[10px] text-slate-400 font-medium">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Added: ${new Date(task.created_at).toLocaleDateString()}
                </div>
            </div>`;
        tasksContainer.innerHTML += card;
    });
}

//update pagination buttons considering the number of tasks present.

function updatePaginationButtons() {

    const nextBtn = document.getElementById('next_btn');
    const prevBtn = document.getElementById('prev_btn');
    const pageNum = document.getElementById('page_number');

    if (!nextBtn || !prevBtn || !pageNum) return;

    const hasNextPage = allTasks.length > currentPage * tasksPerPage;
    const hasPrevPage = currentPage > 1;
    
    if (hasNextPage) {
        nextBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.add('hidden');
    }

    if (hasPrevPage) {
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
    }

    pageNum.innerText = `Page ${currentPage}`;
    
    if (allTasks.length === 0) {
        pageNum.innerText = '';
    }
}

//next page button logic.

function nextPage() {
    if ((currentPage * tasksPerPage) < allTasks.length) {
        displayTasksByPage(currentPage + 1);
    }
}

//previous page button logic.

function prevPage() {
    if (currentPage > 1) {
        displayTasksByPage(currentPage - 1);
    }
}

//complete task button logic, removing by DELETE TASK API on nodejs index.js server request.

async function completeTask(event, taskId) {

    const btn = event.currentTarget;
    const taskCard = btn.closest('div.group');

    if (!taskCard) {
    taskCard.style.pointerEvents = 'none'; 
    taskCard.style.opacity = '0.5';
    taskCard.style.transform = 'scale(0.95)';
    }
    
 

    try {

        const response = await fetch(`/api/delete_task/${taskId}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {

            taskCard.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            taskCard.style.transform = 'translateY(20px) scale(0.9)';
            taskCard.style.opacity = '0';
            
            setTimeout(() => {

                allTasks = allTasks.filter(t => t.id.toString() !== taskId.toString());
                
                if (allTasks.length <= (currentPage - 1) * tasksPerPage && currentPage > 1) {
                    currentPage--;
                }
                
                displayTasksByPage(currentPage);
            }, 400);

        } else {
            alert("Failed: " + result.error);
            taskCard.style.opacity = '1';
            taskCard.style.transform = 'scale(1)';
        }
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}