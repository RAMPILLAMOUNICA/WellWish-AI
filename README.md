
# 🌿 WellWish AI

![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-316192?logo=postgresql)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## 🏆 Hackathon: Google AI Cohort 2

This project was built and deployed during the **Refinement Phase** of the **Google AI Cohort 2** hackathon. 

### 👥 The Team

| Name | Role | Core Contributions |
| :--- | :--- | :--- |
| **Rampilla Deepthi Lakshmi Rajyam** | Team Leader | Authentication System, Demo Video Production |
| **Shaik Nafia** | Team Member | Dashboard Development, Presentation (PPT) |
| **Rampilla Mounica Siva Sai** | Team Member | AI Features (Gemini Integration), Cloud Deployment, Final Debugging & Architecture Polish |

---
## 🚀 Live Demo

* **Frontend (Live App):** [https://well-wish-ai.vercel.app](https://well-wish-ai.vercel.app)
* **Backend API (Swagger Docs):** [https://wellwish-ai-backend.onrender.com/docs](https://wellwish-ai-backend.onrender.com/docs)

---

## Overview

WellWish AI is an AI-powered wellbeing and decision intelligence platform designed to help people better understand their daily emotional and physical state. The app combines structured check-ins, journal reflections, and intelligent analysis to surface meaningful patterns such as stress, burnout risk, mood trends, and recovery opportunities.

By pairing user data with Google Gemini AI, WellWish AI delivers personalized guidance that feels supportive, actionable, and human-centered.

---

## Key Features

- Daily wellbeing check-ins with mood, sleep, stress, hydration, and activity tracking
- Journal logging with reflection-based insights
- AI-powered wellness coaching through Gemini
- Dashboard views for wellbeing trends, streaks, and recent activity
- Burnout and recovery analysis based on user history
- Secure authentication with JWT and password hashing
- Community and dashboard insights for aggregated wellbeing awareness

---

## Tech Stack

### Frontend
- React + Vite
- React Router DOM
- Axios
- Framer Motion
- Recharts
- Deployed on Vercel

### Backend
- FastAPI
- SQLAlchemy ORM
- Pydantic models
- JWT-based authentication
- Python dotenv
- Deployed on Render

### Database
- PostgreSQL for production
- SQLite fallback for local development

---

## Project Structure

```text
WellWish-AI/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemes/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
└── README.md

```

---

## Local Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd WellWish-AI

```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

```

Create a `.env` file inside the backend folder with the required environment variables listed below.

Start the backend server:

```bash
uvicorn app.main:app --reload

```

The API will be available at:

```text
http://localhost:8000

```

### 3. Frontend setup

```bash
cd ../frontend
npm install

```

Create a `.env` file inside the frontend folder and set your API base URL:

```env
VITE_API_URL=http://localhost:8000

```

Run the development server:

```bash
npm run dev

```

The frontend will be available at:

```text
http://localhost:5173

```

---

## Environment Variables

### Backend (.env in the backend folder)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for production. For local development, SQLite is also supported by default. |
| `SECRET_KEY` | Yes | Secret key used for JWT signing. |
| `ALGORITHM` | No | JWT algorithm. Defaults to `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | JWT expiration duration in minutes. |
| `GEMINI_API_KEY` | Yes for AI features | Google Gemini API key used for insights and coaching. |

### Frontend (.env in the frontend folder)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Base URL for the FastAPI backend. |

---

## Deployment

The application is designed for deployment in two separate services:

* Backend: deployed on Render
* Frontend: deployed on Vercel

For production, make sure your Render service has a valid PostgreSQL connection string configured through the `DATABASE_URL` environment variable, and your Vercel frontend points to the deployed backend URL via `VITE_API_URL`.

---

## License

This project is intended for personal and educational use. Please adjust as needed for your own deployment and distribution requirements.

```

```
