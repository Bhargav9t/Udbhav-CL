# Career Ladder 🚀

Career Ladder is an intelligent, personalized career discovery and tracking platform built to help students and professionals navigate opportunities like hackathons, internships, and jobs with the help of AI.

## Features

- **Personalized Feed:** An intelligent dashboard that curates Hackathons, Internships, Jobs, and Research Proposals.
- **AI Career Coach:** A built-in LLM assistant powered by Groq (`llama-3.3-70b-versatile`) that reviews your resume and offers contextual career advice and actionable steps to acquire missing skills.
- **AI Gap Analysis:** Instantly compare your resume against any role. Get a match percentage, identify missing skills, and receive actionable tips without leaving your dashboard.
- **Kanban "My Ladder" Board:** A gamified kanban board to visually track your saved opportunities, featuring XP progress bars, automatically calculated career levels, and next-deadline countdowns.
- **Secure Authentication & DB:** Real-time database and secure authentication powered by Supabase, complete with Row Level Security (RLS).
- **Web Scraping Backend:** A Python backend equipped with Selenium scrapers to dynamically fetch fresh opportunities from platforms like Devpost and store them in the database.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Lucide React
- **Backend:** Python (FastAPI/Selenium scrapers)
- **Database / Auth:** Supabase (PostgreSQL)
- **AI Integration:** Groq API (Llama 3 models)

## Setup Instructions

### 1. Prerequisites
- Node.js & npm
- Python 3.8+
- Supabase Account
- Groq API Key

### 2. Database Setup (Supabase)
1. Create a new Supabase project.
2. Run the SQL scripts in the root directory via the Supabase SQL Editor:
   - `supabase_setup.sql` (Creates base tables and Auth triggers)
   - `opportunities_rls.sql` (Configures security for opportunities)
   - `supabase_user_ladder.sql` (Creates the Kanban tracking table)

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

Run the development server:
```bash
npm run dev
```

### 4. Backend Setup
The root folder contains a Python environment to scrape and manage the `opportunities` database.

```bash
# Create a virtual environment
python -m venv venv
# Activate it
source venv/bin/activate # (or `venv\Scripts\activate` on Windows)
# Install requirements
pip install -r requirements.txt
```

Create a `.env` file in the root directory with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

Run the main scraper:
```bash
python main.py
```

## Deployment

### Deploying the Frontend (Vercel)
The `frontend` folder is pre-configured for Vercel deployment with a `vercel.json` file for proper routing.
1. Create a [Vercel](https://vercel.com/) account and connect your GitHub repo.
2. Select the `frontend` directory as your **Root Directory**.
3. Vercel will automatically detect Vite. 
4. Add your Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY`).
5. Deploy!

### Deploying the Backend Scraper (Render or Heroku)
The backend scraper is designed to run continuously as a background worker. A `Procfile` is included at the root.
1. Connect your GitHub repo to Render (as a Background Worker) or Heroku.
2. Ensure you are building from the root directory.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python main.py` (or let the platform use the `Procfile`).
5. Add your Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
