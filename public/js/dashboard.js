let allTasks = [];
let currentPage = 1;
const tasksPerPage = 3;

document.addEventListener('DOMContentLoaded', async () => {
    const house_name = localStorage.getItem('householdName');
    const houseId = localStorage.getItem('household_id');
    const displayNameElem = document.getElementById('display_name');
    const tasksContainer = document.getElementById('tasks_container');
    const carsContainer = document.getElementById('cars_container');

    if (house_name && displayNameElem) displayNameElem.innerText = house_name;

    if (!houseId || !house_name) {
        window.location.href = '/'; 
        return;
    }

    // Event Delegation for Car Deletion
    if (carsContainer) {
        carsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-car-btn')) {
                const carId = e.target.getAttribute('data-car-id');
                deleteCar(e, carId);
            }
        });
    }

    try {
        const response = await fetch(`/api/get_tasks/${houseId}`);
        const result = await response.json();
        if (result.success && result.tasks.length > 0) {
            allTasks = result.tasks; 
            displayTasksByPage(1); 
        } else {
            if (tasksContainer) tasksContainer.innerHTML = '<p class="text-slate-400 text-center col-span-full py-10 font-medium">No tasks found. Start by adding one!</p>';
            updatePaginationButtons(); 
        }
    } catch (error) {
        console.error("Fetch tasks error:", error);
    }
    loadCars();
});

function displayTasksByPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * tasksPerPage;
    const tasksToShow = allTasks.slice(startIndex, startIndex + tasksPerPage);
    renderTasks(tasksToShow);
    updatePaginationButtons();
}

function renderTasks(tasks) {
    const tasksContainer = document.getElementById('tasks_container');
    if (!tasksContainer) return;
    tasksContainer.innerHTML = ''; 

    tasks.forEach(task => {
        const priorityColor = {
            'high': 'bg-red-100 text-red-700 border-red-200',
            'medium': 'bg-orange-100 text-orange-700 border-orange-200',
            'low': 'bg-blue-100 text-blue-700 border-blue-200'
        }[task.task_argentcy] || 'bg-slate-100 text-slate-700';

        const taskWrapper = document.createElement('div');
        taskWrapper.id = `task-card-${task.id}`;
        taskWrapper.className = "bg-green-400 p-4 rounded-2xl shadow-md shadow-blue-900/5 border border-gray-100 transition-all hover:scale-[1.005] relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full";
        taskWrapper.innerHTML = `
            <div class="flex items-center gap-4 flex-1 min-w-0">
                <button onclick="completeTask(event,'${task.id}')" class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-100 text-white hover:border-green-500 hover:text-green-500 hover:bg-green-50 transition-all duration-300 shadow-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                </button>
                <div class="min-w-0 flex-1 md:flex md:items-baseline md:gap-4">
                    <h3 class="text-base font-bold text-white truncate">${task.task_headline}</h3>
                    <p class="text-[#EEEEEE] text-sm truncate max-w-2xl mt-0.5 md:mt-0">${task.task_body || 'No description provided'}</p>
                </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 border-t sm:border-t-0 border-gray-50 pt-2 sm:pt-0">
                <div class="flex items-center text-xs text-[#EEEEEE] font-medium whitespace-nowrap">
                    <svg class="w-3.5 h-3.5 mr-1 text-[#EEEEEE]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ${new Date(task.created_at).toLocaleDateString('he-IL')}
                </div>
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border text-center min-w-[75px] whitespace-nowrap ${priorityColor}">
                    ${task.task_argentcy}
                </span>
            </div>
        `;
        tasksContainer.appendChild(taskWrapper);
    });
}

function updatePaginationButtons() {
    const nextBtn = document.getElementById('next_btn');
    const prevBtn = document.getElementById('prev_btn');
    const pageNum = document.getElementById('page_number');
    if (!nextBtn || !prevBtn || !pageNum) return;
    nextBtn.classList.toggle('hidden', !(allTasks.length > currentPage * tasksPerPage));
    prevBtn.classList.toggle('hidden', !(currentPage > 1));
    pageNum.innerText = allTasks.length === 0 ? '' : `Page ${currentPage}`;
}

function nextPage() { if (currentPage * tasksPerPage < allTasks.length) displayTasksByPage(currentPage + 1); }
function prevPage() { if (currentPage > 1) displayTasksByPage(currentPage - 1); }

async function completeTask(event, taskId) {
    const taskCard = event.currentTarget.closest('div.group');
    if (taskCard) { taskCard.style.pointerEvents = 'none'; taskCard.style.opacity = '0.5'; }
    try {
        const response = await fetch(`/api/delete_task/${taskId}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok && result.success) {
            taskCard.style.transition = 'all 0.4s ease';
            taskCard.style.opacity = '0';
            setTimeout(() => {
                allTasks = allTasks.filter(t => t.id.toString() !== taskId.toString());
                if (allTasks.length <= (currentPage - 1) * tasksPerPage && currentPage > 1) currentPage--;
                displayTasksByPage(currentPage);
            }, 400);
        } else {
            alert(result.error || "Failed to delete task.");
            if (taskCard) taskCard.style.opacity = '1';
        }
    } catch (e) { alert("Server error."); if (taskCard) taskCard.style.opacity = '1'; }
}

async function loadCars() {
    const houseId = localStorage.getItem('household_id');
    const carContainer = document.getElementById('cars_container');
    if (!carContainer) return;
    try {
        const response = await fetch(`/api/get_cars/${houseId}`);
        const result = await response.json();
        if (response.ok && result.success) renderCars(result.cars);
        else carContainer.innerHTML = '<p class="text-slate-400 text-center col-span-full py-10 font-medium">No cars registered yet.</p>';
    } catch (e) { console.error(e); }
}

function renderCars(cars) {
    const carsContainer = document.getElementById('cars_container');
    if (!carsContainer) return;
    carsContainer.innerHTML = ''; 
    cars.forEach(car => {
        const statusBadge = car.active ? '<span class="bg-green-100 text-green-700 border-green-200 px-2 py-0.5 rounded-full text-[10px] font-bold">ACTIVE</span>' : '<span class="bg-gray-100 text-gray-500 border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-bold">INACTIVE</span>';
        const pdfButtonHtml = car.registration_pdf_url ? `<a href="${car.registration_pdf_url}" target="_blank" class="flex-1 py-2 text-center text-xs font-bold text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">📄 View PDF</a>` : `<label class="flex-1 py-2 text-center text-xs font-bold text-slate-500 hover:text-white hover:bg-[#792CA2] rounded-xl transition-colors border border-transparent cursor-pointer block">Upload Registry<input type="file" accept="application/pdf" class="hidden" onchange="uploadRegistrationPdf(event, '${car.id}')"></label>`;
        const cardWrapper = document.createElement('div');
        cardWrapper.id = `car-card-${car.id}`;
        cardWrapper.className = "bg-green-400 p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 transition-all hover:scale-[1.02] relative overflow-hidden group";
        cardWrapper.innerHTML = `
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div><h3 class="text-xl font-bold text-white">${car.make}</h3><p class="text-white text-sm font-medium">${car.model} (${car.year})</p></div>
                ${statusBadge}
            </div>
            <div class="space-y-3 relative z-10">
                <div class="flex items-center text-sm text-white"><span class="font-medium mr-2">Annual Test:</span><span class="ml-auto font-bold ${isTestClose(car.annual_test) ? 'text-red-500' : 'text-white'}">${new Date(car.annual_test).toLocaleDateString('he-IL')}</span></div>
            </div>
            <div class="mt-6 flex gap-2 relative z-10 border-t border-gray-50 pt-4">
                <button onclick="promptTestRenewal('${car.id}', '${car.annual_test}')" class="flex-1 py-2 text-xs font-bold text-green-600 hover:text-white hover:bg-green-300 rounded-xl transition-colors border border-transparent">Renew Test</button>
                ${pdfButtonHtml}
            </div>
            <div class="mt-2 flex gap-2 relative z-10">
                <button data-car-id="${car.id}" class="delete-car-btn flex-1 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-400 rounded-xl transition-colors border border-transparent">
                    Remove Car
                </button>
            </div>
        `;
        carsContainer.appendChild(cardWrapper);
    });
}

async function deleteCar(event, carId) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    
    if (!(await showCustomConfirmModal("Are you sure you want to remove this vehicle?"))) return;
    
    const carCard = document.getElementById(`car-card-${carId}`);
    
    try {
        const response = await fetch(`/api/delete_car/${carId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok && result.success) {
            
            if (carCard) {
                carCard.classList.add('animate-fade-slide');
                
                setTimeout(() => {
                    carCard.remove();
                }, 500); 
            }
        } else {
            alert(result.error || "Delete failed");
        }
    } catch (e) { 
        alert("Network error"); 
    }
}

function showCustomConfirmModal(message) {
    return new Promise((resolve) => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm opacity-0 transition-opacity duration-300";
        modalOverlay.innerHTML = `
            <div class="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-gray-100 transform scale-95 opacity-0 transition-all duration-300 flex flex-col items-center text-center">
                <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">Delete Vehicle</h3>
                <p class="text-slate-500 text-sm mb-6">${message}</p>
                <div class="flex gap-3 w-full">
                    <button id="modal-cancel-btn" class="flex-1 py-2.5 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-gray-100">Cancel</button>
                    <button id="modal-confirm-btn" class="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-500/20 transition-colors">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
        const modalBox = modalOverlay.querySelector('div');
        requestAnimationFrame(() => {
            modalOverlay.classList.remove('opacity-0');
            if (modalBox) modalBox.classList.remove('scale-95', 'opacity-0');
        });
        const closeModal = (result) => {
            modalOverlay.classList.add('opacity-0');
            if (modalBox) modalBox.classList.add('scale-95', 'opacity-0');
            setTimeout(() => { modalOverlay.remove(); resolve(result); }, 300);
        };
        modalOverlay.querySelector('#modal-confirm-btn').addEventListener('click', () => closeModal(true));
        modalOverlay.querySelector('#modal-cancel-btn').addEventListener('click', () => closeModal(false));
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(false); });
    });
}

function isTestClose(dateString) {
    if (!dateString) return false;
    const testDate = new Date(dateString);
    const today = new Date();
    const diffTime = testDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
}