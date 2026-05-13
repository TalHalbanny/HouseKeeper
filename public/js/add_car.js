const add_car = async (e) => {

    e.preventDefault();

    const house_id = localStorage.getItem('household_id');
    const inserted_year = document.getElementById('car_year').value;
    const inserted_maker = document.getElementById('maker_name').value;
    const inserted_model = document.getElementById('model_name').value;
    const inserted_date = document.getElementById('test_date').value;

    const inserted_active = document.querySelector('input[name="status"]:checked');
    const is_active_boolean = inserted_active ? inserted_active.value === 'true' : false;

    try {
        const respone = await fetch('/api/add_car', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }, 

            body: JSON.stringify({
                house_id: house_id,
                car_maker: inserted_maker,
                car_model: inserted_model,
                car_year: inserted_year,
                test: inserted_date,
                isActive: is_active_boolean 
            })

        });

        const result = await respone.json();

        if (result.sucess) {
            Toastify({
        text: "Car Added Successfully!",
        duration: 3000, 
        gravity: "bottom",
        position: "right", 
        style: {
            background: "linear-gradient(to right, #00b09b, #00ff66)",
            borderRadius: "15px",
        }

        }).showToast();

        document.getElementById('carRegistrationForm').reset();
        }

        else {
            alert('Failed to Insert Data!' + result.error)
        }

        
    } catch (error) {

        console.log("Error Occured On Server Side:" + " " + error)
        alert("Failure in Inserting Data!")

    }

};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('carRegistrationForm');
    if (form) {
        form.addEventListener('submit', add_car);
    } else {
        console.error("Form not found! Check if ID is correct.");
    }
});
