# 🌿 WellWish AI – AI Decision Intelligence for Personalized Wellbeing

![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## 📖 Overview

**WellWish AI** is an AI-powered wellbeing platform that helps users monitor, understand, and improve their physical and mental wellbeing through personalized insights.

Unlike traditional health trackers that simply display data, WellWish AI analyzes user behaviour, identifies wellbeing trends, detects early signs of burnout, and provides actionable recommendations using **Google Gemini AI**.

The platform supports both users with wearable devices and those without smartwatches by estimating wellbeing through structured daily check-ins and journal reflections.

---

# 🎯 Problem Statement

Many individuals experience stress, anxiety, burnout, and unhealthy lifestyles but lack an intelligent system that explains *why* their wellbeing changes over time.

Existing wellbeing applications often:

- Focus only on activity tracking
- Require expensive wearable devices
- Show raw statistics without meaningful interpretation
- Do not provide personalized AI guidance
- Fail to identify long-term wellbeing trends

---

# 💡 Solution

WellWish AI transforms daily wellbeing data into meaningful insights using Artificial Intelligence.

It combines:

- Daily wellbeing check-ins
- Journal sentiment analysis
- Historical trend comparison
- AI-powered wellness coaching
- Burnout prediction
- Personalized recovery suggestions

to help users make healthier decisions every day.

---

# ✨ Key Features

## 🔐 Secure Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes

---

## 📊 Personalized Dashboard

Displays:

- Wellbeing Index
- Burnout Risk
- Recovery Score
- Sleep Tracking
- Hydration Progress
- Mood Status
- Activity Tracking
- Journal Streak

Dashboard updates dynamically based on actual user data.

---

## 📝 Daily Wellbeing Check-In

Supports two modes.

### Wearable Connected

Users can sync:

- Steps
- Heart Rate
- Sleep Hours

### No Wearable Mode

Wellbeing is estimated using:

- Mood
- Sleep Quality
- Stress Level
- Anxiety
- Motivation
- Physical Activity
- Appetite
- Social Interaction

This allows everyone to use the application even without a smartwatch.

---

## 🤖 AI Wellbeing Coach (Willa)

Powered by **Google Gemini AI**

Willa can:

- Analyze wellbeing history
- Compare previous check-ins
- Explain why wellbeing changed
- Suggest recovery plans
- Recommend healthier habits
- Detect possible burnout trends
- Generate personalized wellness guidance

---

## 📓 Smart Journal

Users can maintain daily journals.

Each journal is automatically analyzed for:

- Positive sentiment
- Neutral sentiment
- Negative sentiment

AI identifies emotional trends over time.

---

## 🌍 Community Insights

Displays anonymous aggregate wellbeing insights including:

- Average wellbeing score
- Mood distribution
- Stress trends

No personal information is exposed.

---

## 🔒 Privacy First

WellWish AI follows a privacy-focused approach.

- Password encryption
- JWT authentication
- Secure API endpoints
- Local database storage
- No fake statistics
- No fabricated medical claims

---

# 🏗 System Architecture

```
Frontend (React + Vite)
        │
        ▼
FastAPI Backend
        │
        ▼
Authentication (JWT)
        │
        ▼
SQLite Database
        │
        ▼
Google Gemini AI
```

---

# 🛠 Tech Stack

## Frontend

- React (Vite)
- React Router
- Axios
- CSS

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- JWT
- Passlib
- Pydantic

## Artificial Intelligence

- Google Gemini API

## Deployment

- Vercel
- Render

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```
WellWish-AI
│
├── backend
│   ├── app
│   │   ├── auth
│   │   ├── database
│   │   ├── models
│   │   ├── routers
│   │   ├── schemes
│   │   ├── services
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── render.yaml
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   └── services
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/RAMPILLAMOUNICA/WellWish-AI.git

cd WellWish-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend (.env)

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

SECRET_KEY=YOUR_SECRET_KEY

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## Frontend (.env)

```
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL
```

---

# 🌐 Live Demo

**Frontend**

```
https://well-wish-ai.vercel.app/
```

**Backend API**

```
https://wellwish-ai-backend.onrender.com
```

---



# 🚀 Future Enhancements

The current version establishes a strong foundation for AI-assisted wellbeing management. Future versions can further improve personalization, accessibility, and healthcare integration.

### ✅ Wearable Device Integration

Support devices such as:

- Apple Watch
- Fitbit
- Garmin
- Samsung Galaxy Watch
- Google Pixel Watch

Automatically synchronize:

- Heart Rate
- Heart Rate Variability (HRV)
- Blood Oxygen (SpO₂)
- Sleep Stages
- Stress Levels
- Calories Burned
- Activity Rings

---

### 🧠 Advanced AI Personalization

Enable continuous AI learning from historical wellbeing patterns to provide increasingly personalized recommendations while preserving user privacy.

---

### 🚨 Early Burnout & Mental Health Detection

Improve AI capabilities to identify prolonged stress, burnout, or emotional distress earlier and recommend appropriate coping strategies or professional support resources.

---

### 🏥 Healthcare Integration

Allow users to securely share wellbeing reports with healthcare professionals, therapists, or wellness coaches through encrypted PDF reports.

---

### 🏢 Enterprise Wellness Dashboard

Introduce organizational wellbeing analytics for HR teams with anonymous department-level insights, burnout prediction, and wellness campaign recommendations while maintaining employee privacy.

---

### 🎮 Gamification

Increase user engagement through:

- Daily streaks
- Wellness badges
- Weekly challenges
- Achievement rewards
- Community events

---

### 🎙 Voice-Based AI Assistant

Enable voice conversations with Willa AI using speech recognition and text-to-speech for hands-free wellbeing guidance.

---

### 🌍 Multilingual Support

Expand accessibility by supporting multiple regional and international languages.

---

### 📈 Predictive Wellbeing Intelligence

Use historical data and AI forecasting to predict future wellbeing trends, allowing users to take preventive action before stress or burnout escalates.

---

# 🎯 Vision

Our vision is to transform WellWish AI into a proactive digital wellbeing companion that empowers individuals to understand, improve, and sustain their physical and mental wellness through ethical artificial intelligence.

Rather than simply tracking health metrics, WellWish AI aims to provide intelligent, personalized, and actionable guidance that supports healthier lifestyles while respecting user privacy.

---

# 👩‍💻 Developers

**RAMPILLA MOUNICA SIVA SAI**
**RAMPILLA DEEPTHI LAKSHMI RAJYAM**
**SHAIK NAFIA**

B.Tech – Artificial Intelligence & Machine Learning

GitHub:

https://github.com/RAMPILLAMOUNICA/WellWish-AI

---

# 📄 License

This project was developed for educational and hackathon purposes.

Future commercial use may require additional compliance with healthcare, privacy, and AI regulations.
