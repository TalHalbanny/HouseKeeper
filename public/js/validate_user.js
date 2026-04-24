
const validationForm = document.getElementById('login_form')

validationForm.addEventListener('submit', async (f)=> {

    f.preventDefault();

    const validationPayload = {
        email: document.getElementById('InputMail').value,
        pinCode: document.getElementById('InputPIN').value
    }

    try {
        const sendValidationData = await fetch('/api/validate_entry', {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(validationPayload)
        });

        const serverResult = await sendValidationData.json(); //wait for response as json.

        //CHECK SERVER RESPONSE

        if(serverResult.validated) {
            window.location.href = '/Dashboard';
        }
        else {
            console.log("User LOGIN Failed!")
            alert("Failed to LOGIN:" + " " + serverResult.error)
        }
    } catch (error) {
        console.error("Failed to Validate With Server" + " " + error);
    }

})