const addTask = async (e) => {

    e.preventDefault();

    const house_id = localStorage.getItem('household_id');
    const inserted_headline = document.getElementById('task_headline').value;
    const inserted_body = document.getElementById('task_body').value;
    const inserted_urgency = document.getElementById('task_urgency').value;

    if (!house_id) {
        alert("Session Expired, Please Log In Again!")
        return;
    }

    const payload = {
        house_id: house_id,
        headline: inserted_headline,
        description: inserted_body,
        urgency: inserted_urgency
    };

    try {
         const response = await fetch('/api/add_task', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })

    const result = await response.json();

    if (result.success) {
        alert('Task Added Succesfully!')
        document.getElementById('task_form').reset();
    }
    else {
        alert('Error Inserting new Task!' + " " + result.error);
    }

    } catch (error) {
        console.error('Failed to Add Task:' + " " + error);
        alert("Server Error Occured, Task Add Process Failed!")
    }
}

document.getElementById('task_form').addEventListener('submit', addTask);