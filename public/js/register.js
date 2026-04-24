const form = document.querySelector('form')

form.addEventListener('submit',  async (e)=> {
    e.preventDefault();



const payload_form_data = { //PACK DATA FROM FORM TO BACKEND BRIDGE FUNCTION.
    housename: document.getElementById('name').value,
    password: document.getElementById('password').value,
    email: document.getElementById('email').value}

try {

const send_res = await fetch('/api/register', { //ATTEMPT TO SEND DATA TO BACKEND TO RELEVENT PATH
    method: 'POST',
    headers: {'Content-Type':'Application/json'},
    body: JSON.stringify(payload_form_data)
})

const result = await send_res.json() 

//CHECK IF SUCEESS OR FAILED.


if (result.success) {
    document.getElementById('displayPin').innerText = result.pin;
    const modal = document.getElementById('pinModal');
    modal.classList.remove('hidden');
} else {
    alert('Registring Failed:' + " " + result.error)
}

} catch (err){
    console.error("Network Error", err)

}

})