//insert username to dashboard page nav by element id and localstorage (saved in nodejs server and passed on.)

document.addEventListener('DOMContentLoaded', () => {
    const house_name = localStorage.getItem('householdName')

    if (house_name) {
        document.getElementById('display_name').innerText = `${house_name}`;
    } else {
        window.location.href('/');
    }
})
