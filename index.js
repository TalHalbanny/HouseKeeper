const express = require('express');
const path = require('path');
require('dotenv').config();
const supabase = require('./public/js/supabase'); // IMPORT SUPABASE.JS
const multer = require('multer');

// Configure upload limits/memory buffers safely
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // MIDDLEWARE

// SUPABASE FUNCTIONS
async function InsertNewHousehold(housename, email, passkey) {
    const PIN = Math.floor(1000 + Math.random() * 9000).toString();

    const { data, error } = await supabase
        .from('households')
        .insert([
            {
                household_name: housename,
                email_adress: email, 
                password: passkey, 
                pin_code: PIN 
            }
        ])
        .select();

    if (error) {
        console.log('Error!' + error.message);
        return { success: false, error: error.message };
    }

    console.log(`Success! New Household PIN Code is ${PIN}`);
    return { success: true, data: data[0] };
}


// API ROUTES FOR FRONTEND BACKEND COMMUNICATION

// 1. VALIDATE ENTRY API
app.post('/api/validate_entry', async (req, res) => {
    const { email, pinCode } = req.body;

    if (!email || !pinCode) {
        return res.status(400).json({
            validated: false,
            error: "All Fields are required!"
        });
    }

    try {
        const { data: registereHouse, error: supabaseError } = await supabase
            .from('households')
            .select('id, email_adress, pin_code, household_name')
            .eq('email_adress', email)
            .eq('pin_code', pinCode)
            .maybeSingle();

        if (supabaseError) {
            console.error("Supabase Error:", supabaseError.message);
            throw supabaseError;
        }

        if (!registereHouse) {
            return res.status(401).json({
                validated: false,
                error: "Invalid Mail or PIN Code"
            });
        } 

        return res.status(200).json({
            validated: true,
            message: "All Data Legal, Login Success",
            householdName: registereHouse.household_name,
            household_id: registereHouse.id
        });

    } catch (err) {
        console.error("Catch Block Error:", err); 
        return res.status(500).json({
            validated: false,
            error: "Server Error! Please Try Again."
        });
    } 
});

// 2. REGISTER API
app.post('/api/register', async (req, res) => { 
    const { housename, email, password } = req.body;

    if (!housename || !email || !password) {
        return res.status(400).json({
            success: false,
            error: "All Fields are required"
        });
    }
     
    const { data: existinguser } = await supabase 
        .from('households')
        .select('email_adress')
        .eq('email_adress', email)
        .maybeSingle();

    if (existinguser) {
        return res.status(400).json({  
            success: false,
            error: "This Email already connected to an Account!"
        });  
    }

    const insert_result = await InsertNewHousehold(housename, email, password);

    if (insert_result.success) {
        res.json({ success: true, message: "Welcome!", pin: insert_result.data.pin_code });
    } else {
        res.status(500).json({ success: false, message: "Error Occurred", error: insert_result.error });
    }
});

// 3. ADD TASK API
app.post('/api/add_task', async (req, res) => {
    const { description, headline, urgency, house_id } = req.body;

    const { data, error } = await supabase
        .from('tasks')
        .insert([{
            household_id: house_id,
            task_headline: headline,
            task_body: description,
            task_argentcy: urgency
        }]);

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true });
});

// 4. RETRIEVE TASKS BY HOUSEHOLD ID

app.get('/api/get_tasks/:house_id', async (req, res) => {
    const { house_id } = req.params;

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('household_id', house_id)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, tasks: data });
});

// 5. TASK DELETE 

app.delete('/api/delete_task/:taskId', async (req, res) => {
    const { taskId } = req.params;

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        console.log("Attempting to delete task with ID:", taskId);
        return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true });
});

// 6. ADD A CAR TO HOUSEHOLD

app.post('/api/add_car', async (req, res) => {
    
    console.log("DEBUG: Received car data:", req.body);

    const { house_id, car_maker, test, car_model, car_year, isActive } = req.body;

    if (!house_id || !car_maker || !car_model) {
        console.error("Validation failed. Received:", { house_id, car_maker, car_model });
        return res.status(400).json({ 
            success: false, 
            error: `Missing required fields. Received: house_id=${house_id}, car_maker=${car_maker}, car_model=${car_model}` 
        });
    }

    try {
        const { error } = await supabase
            .from('cars')
            .insert([{
                household_id: house_id,
                model: car_model,
                make: car_maker,
                annual_test: test,
                active: isActive === true || isActive === 'true', 
                year: car_year ? parseInt(car_year, 10) : null  
            }]);

        if (error) {
            console.error("Supabase insert error details:", error);
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.json({ success: true });

    } catch (err) {
        console.error("Unhandled system exception:", err);
        return res.status(500).json({ success: false, error: err.message || "Internal server error" });
    }
});

// 7. GET CAR DATA

app.get('/api/get_cars/:house_id', async (req, res) => {
    const { house_id } = req.params;

    const { data, error } = await supabase 
        .from('cars')
        .select('*')
        .eq('household_id', house_id);
        
    if (error) {
        return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, cars: data });
});

// 8. UPDATE CAR ANNUAL TEST 

app.put('/api/update_car_test/:carId', async (req, res) => {
    const { carId } = req.params;
    const {new_test_date} = req.body;

    if (!new_test_date) {
        return res.status(400).json({ success: false, error: "New Test Date is Required" });
    }

    try {
        const { error } = await supabase
            .from('cars')
            .update({ annual_test: new_test_date })
            .eq('id', carId);
            
        if (error) throw error;

        return res.json({ success: true });
    } catch (err) {
        console.error("Error Updating Car Test Date: " + err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 9. UPLOAD CAR PDF FILE TO BUCKET ON SUPABASE

app.post('/api/upload_car_pdf/:carId', upload.single('registration_pdf'), async (req, res) => {
    const { carId } = req.params;

    if (!req.file) {
        return res.status(400).json({ success: false, error: "No File Uploaded" });
    }

    try {

        const filename = `registrations/car-${carId}-${Date.now()}.pdf`;

        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('car_documents')
            .upload(filename, req.file.buffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (storageError) throw storageError;

        const { data: UrlData } = await supabase
            .storage
            .from('car_documents')
            .getPublicUrl(filename);

        const PublicUrl = UrlData.publicUrl;

        const { error: dberror } = await supabase
            .from('cars')
            .update({ registration_pdf_url: PublicUrl })
            .eq('id', carId);

        if (dberror) throw dberror;

        return res.json({ success: true, url: PublicUrl });

    } catch (err) {
        console.error("Error Occurred While Uploading: " + err);
        res.status(500).json({ success: false, error: err.message });
    }
});

//10. DELETE CAR ROUTE

app.delete('/api/delete_car/:carId', async (req, res) => {
    const { carId } = req.params;

    try {
        const { error } = await supabase
            .from('cars')
            .delete()
            .eq('id', carId);

        if (error) throw error;

        return res.json({ success: true });
    } catch (err) {
        console.error("Database deletion failure:", err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
});


app.use(express.static(path.join(__dirname, 'public'))); // STATIC PATH DEFINITION.

// STATIC PAGES ROUTES
app.get('/Dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.get('/add_task', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/add_task.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/register.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/add_to_house', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/add_to_home.html'));
});

app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});