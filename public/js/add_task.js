const addTask = async (taskDescription) => {

    const house_id = localStorage.getItem('household_id');

    const payload = {
        description: taskDescription,
        household_id: house_id
    };

    await fetch('/api/add_task', {
        method: POST,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
}