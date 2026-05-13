const express = require('express');
const path = require('path');
require('dotenv').config();
const supabase = require('./public/js/supabase'); //IMPORT SUPABASE.JS

const app = express();
const port = process.env.PORT;

app.use(express.json()); //MIDDLEWARE

//SUPABASE FUNCTIONS

async function InsertNewHousehold(housename, email, passkey) {

    const PIN = Math.floor(1000+Math.random()*9000).toString();

    const {data, error} = await supabase
    .from('households')
    .insert([
        {
        household_name: housename,
        email_adress: email, 
        password: passkey, 
        pin_code: PIN }
    ])

    .select();

    if (error) {
        console.log('Error!' + error.message);
        return {success: false, error: error.message};
    }

    console.log(`Success! New Household PIN Code is ${PIN}`);
    return { success: true, data: data[0] };

}


//API ROUTES FOR FRONTEND BACKEND COMMUNICATION

//1. VALIDATE ENTRY API: VALIDATE USER DATA FROM FRONTEND AND RETURN APPROVAL OR FAIL TO LOGIN!

app.post('/api/validate_entry', async (req,res) => {
    
    const {email, pinCode} = req.body;

    if (!email || !pinCode) {
        return res.status(400).json({
        validated: false,
        error: "All Fields are required!"})
    }

    try{

    const {data: registereHouse, error: supabaseError} = await supabase
    .from('households')
    .select('id,email_adress, pin_code, household_name')
    .eq('email_adress', email)
    .eq('pin_code', pinCode)
    .maybeSingle();

    if (supabaseError) {
            console.error("Supabase Error:", supabaseError.message);
            throw supabaseError;
        }

    if (!registereHouse){
        return res.status(401).json({
            validated: false,
            error: "Invalid Mail or PIN Code"
        })
    } 

    return res.status(200).json({
        validated: true,
        message: "All Data Legal, Login Success",
        householdName: registereHouse.household_name,
        household_id: registereHouse.id
    })


    } catch (err) {
       console.error("Catch Block Error:", err); 
        return res.status(500).json({
            validated: false,
            error: "Server Error! Please Try Again."
    })
 } 
})

//2. REGISTER API: RECIEVE DATA FROM FRONTEND OF DATA AND CHECK FOR APPROVAL AND RETURN AS JSON.

app.post('/api/register', async (req,res) => { 
    
    //recieve json file contents from register.js, open files back to req.body object.

    const {housename, email, password} = req.body;

    //check if all fields are filled.

    if(!housename || !email || !password) {
        return res.status(400).json({
        success: false,
        error: "All Fields are required"})
}
     
    //check if email already registered.

    const {data: existinguser} = await supabase 
    .from('households')
    .select('email_adress')
    .eq('email_adress', email)
    .maybeSingle();

    if (existinguser) {
        return res.status(400).json({  
            success: false,
            error: "This Email already connected to an Acoount!"})  
    }

    const insert_result = await InsertNewHousehold(housename, email, password);


    if(insert_result.success) {
        
        res.json({success: true, message: "Welcome!", pin: insert_result.data.pin_code});
    }
    else {
        res.status(500).json({success: false, message: "Error Occured", error: insert_result.error});
    }

})

//3. ADD TASK API

app.post('/api/add_task', async (req, res) => {

    const {description, headline, urgency, house_id} = req.body;

    const {data , error} = await supabase
    .from('tasks')
    .insert([{
        household_id: house_id,
        task_headline: headline,
        task_body: description,
        task_argentcy: urgency
    }]);

    if (error) return res.status(400).json({success: false, error: error.message});
    res.json({success: true});

});

//4. RETRIEVE TASKS BY HOUSEHOLD id

app.get('/api/get_tasks/:house_id', async (req , res)=>{

    const {house_id} = req.params;

    const {data , error} = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', house_id)
    .order('created_at', {ascending: false});

    if (error) {
        return res.status(400).json({success: false, error: error.message});
    }

    return res.json({success: true, tasks: data});
});

//5. TASK DELETE 

app.delete('/api/delete_task/:taskId', async (req,res) => {
    
    const {taskId} = req.params;

    const {data, error} = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

    if (error) {
        console.log("Attempting to delete task with ID:", taskId);
        return res.status(400).json({success: false, error: error.message});
    }

    return res.json({success: true})

});

//6. ADD A CAR TO HOUSEHOLD

app.post('/api/add_car', async (req,res) => {

    const {house_id, car_maker, test, car_model, car_year, isActive} = req.body;

    const {data, error} = await supabase

    .from('cars')
    .insert([{
        household_id: house_id,
        model: car_model,
        make: car_maker,
        annual_test: test,
        active: isActive,
        year: car_year
    }])

    if(error) return res.status(400).json({sucess: false, error: error.message});

    res.json({sucess: true});

});

//7. GET CAR DATA

app.get('/api/get_cars/:house_id' , async (req, res) => {

    const {house_id} = req.params;

    const {data , error } = await supabase 
    .from ('cars')
    .select('*')
    .eq('household_id', house_id)
    
    if (error) {
        return res.status(400).json({success: false, error: error.message});
    }

    return res.json({success: true, cars: data });

})


app.use(express.static(path.join(__dirname,'public'))); //STATIC PATH DEFINISION.

//STATIC PAGES ROUTES:

app.get('/Dashboard', (req,res) => {
    res.sendFile(path.join(__dirname,'views/dashboard.html'))
})

app.get('/add_task', (req,res) => {
    res.sendFile(path.join(__dirname, 'views/add_task.html'))
})

app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, 'views/register.html'))
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'))
});

app.get('/add_to_house', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/add_to_home.html'))
})

app.listen(port, () => {
    console.log(`Server Running on ${port}`)
});

