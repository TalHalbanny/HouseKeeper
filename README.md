# HouseKeeper

A household management web app for families and shared homes. Register a household, sign in with email and PIN, and manage tasks, vehicles, and more from a single dashboard.

Built with **Node.js**, **Express**, and **Supabase** (database + file storage), with a **Tailwind CSS** frontend.

---

## Features

| Area | Status |
|------|--------|
| Household registration (auto-generated PIN) 
| Login (email + PIN) 
| Dashboard overview 
| Tasks (add, list, mark complete / delete) 
| Cars (add, list, delete, renew annual test) 
| Car registration PDF upload (Supabase Storage) 
| Documents, events, shopping lists, residents, pets 

Session data is stored in the browser (`localStorage`: `household_id`, `householdName`).

---

## Tech stack

- **Runtime:** Node.js  
- **Server:** Express 5  
- **Database & storage:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`)  
- **Uploads:** Multer (in-memory) → Supabase bucket `car_documents`  
- **Frontend:** HTML pages in `public/pages/`, vanilla JavaScript in `public/js/`  
- **Styling:** Tailwind CSS (CDN) + `public/css/app.css`  
- **Config:** dotenv (`.env`)

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)  
- A Supabase project with the required tables and storage bucket (see [Database setup](#database-setup))

---

## Quick start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd HouseKeeper
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (this file is gitignored):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

`PORT` is optional; default is `3000`.

> **Security:** Prefer environment variables only. Do not commit real keys. If your `index.js` includes fallback Supabase values, replace them with your own project or remove the fallbacks before publishing the repo.

### 3. Run the server

```bash
node index.js
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Optional — Tailwind build

The app works with the Tailwind CDN. To compile local CSS (if you add `input.css`):

```bash
npm run dev
```

---

## Application routes

| URL | Page |
|-----|------|
| `/` | Login |
| `/register` | Create household |
| `/Dashboard` | Main dashboard |
| `/add_task` | Add task |
| `/add_to_house` | Add car / resident / pet |
| `/documents` | Document upload (UI) |
| `/event_calendar` | Events (UI) |
| `/shopping_list` | Shopping lists (UI) |

Static assets are served from `public/` (JS, CSS, images under `public/assets/`).

---

## API overview

All JSON APIs are defined in `index.js`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Register household; returns PIN |
| `POST` | `/api/validate_entry` | Login with email + PIN |
| `POST` | `/api/add_task` | Create task |
| `GET` | `/api/get_tasks/:house_id` | List tasks |
| `DELETE` | `/api/delete_task/:taskId` | Delete task |
| `POST` | `/api/add_car` | Add vehicle |
| `GET` | `/api/get_cars/:house_id` | List vehicles |
| `PUT` | `/api/update_car_test/:carId` | Update annual test date |
| `POST` | `/api/upload_car_pdf/:carId` | Upload registration PDF (`registration_pdf` field) |
| `DELETE` | `/api/delete_car/:carId` | Remove vehicle |

---

## Database setup

Configure Supabase to match what the server expects (names may vary slightly in your schema):

### Tables (conceptual)

- **`households`** — e.g. `household_name`, `email_adress`, `password`, `pin_code`  
- **`tasks`** — e.g. `household_id`, `task_headline`, `task_body`, `task_argentcy`, `created_at`  
- **`cars`** — e.g. `household_id`, `make`, `model`, `year`, `annual_test`, `active`, `registration_pdf_url`

### Storage

- Bucket: **`car_documents`** (public URL used for PDF links after upload)

Enable Row Level Security and policies appropriate for your deployment. For local development you may use the anon key with policies that match your threat model.

---

## Project structure

```
HouseKeeper/
├── index.js              # Express server + REST API
├── package.json
├── .env                  # Local secrets (not committed)
├── public/
│   ├── assets/           # Images, logos
│   ├── css/
│   │   └── app.css       # App-specific styles
│   ├── js/               # Client scripts + supabase.js (server-side import)
│   └── pages/            # HTML pages served by route map
└── views/                # Legacy HTML (superseded by public/pages/)
```

---

## Development notes

- After changing **`index.js`**, restart the server (`node index.js`).  
- HTML/JS/CSS under `public/` are served statically and reload on refresh.  
- Protected pages use `public/js/auth-guard.js` (redirect to `/` if not logged in).  
- Navigation and profile UI: `public/js/nav.js`.

---

## License

ISC — see `package.json`.

---

## Author

Tal Halbanny 
