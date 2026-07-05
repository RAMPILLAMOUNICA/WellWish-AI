# 🌿 WellWish AI
### AI-Powered Decision Intelligence Platform for Proactive Wellbeing

WellWish AI is an AI-powered Decision Intelligence Platform designed to help individuals proactively monitor, understand, and improve their wellbeing. The platform analyzes daily wellbeing data, journal reflections, and lifestyle patterns to generate personalized AI insights and actionable recommendations.

Unlike traditional wellbeing applications, WellWish AI intelligently works **with or without wearable devices**, making personalized wellbeing accessible to everyone.

---

## 🚀 Problem Statement

Modern lifestyles expose people to increasing levels of stress, anxiety, burnout, and unhealthy habits. Existing wellbeing applications often:

- Depend on wearable devices
- Focus only on tracking data
- Provide generic recommendations
- Lack explainable AI insights

WellWish AI addresses these challenges by transforming wellbeing data into intelligent decisions through AI.

---

# 💡 Solution

WellWish AI continuously analyzes user wellbeing using:

- Daily Check-ins
- Journal Reflections
- Mood Tracking
- Sleep Quality
- Hydration
- Physical Activity
- Screen Time
- Historical Trends
- Wearable Data (Optional)

The AI then generates:

- Wellbeing Index
- Recovery Insights
- Personalized Recommendations
- Stress Trend Analysis
- Daily Wellness Priorities

---

# ✨ Key Features

## 🔐 Secure Authentication

- User Registration
- User Login
- JWT Authentication
- Password Encryption
- Protected Routes

---

## 📊 Smart Dashboard

- Wellbeing Index
- Recovery Score
- Mood Tracking
- Sleep Summary
- Hydration Progress
- Activity Tracking
- Weekly Trends
- AI Insights

---

## 📝 Daily Check-in

Users complete a simple daily wellbeing questionnaire.

Supports two intelligent modes:

### ✅ Wearable Connected

Uses:

- Heart Rate
- Steps
- Sleep
- Activity

### ✅ Guided Wellbeing Mode

Calculates wellbeing using:

- Mood
- Sleep
- Anxiety
- Motivation
- Work Pressure
- Water Intake
- Screen Time
- Physical Activity
- Social Interaction
- Journal Sentiment

---

## 🤖 Willa AI Coach

Willa is the built-in AI wellbeing assistant.

Capabilities:

- Understands journal reflections
- Detects wellbeing trends
- Explains stress changes
- Generates personalized recommendations
- Encourages healthy habits
- Provides supportive guidance

---

## 📖 AI Journal Analysis

Users can maintain a personal wellbeing journal.

Gemini AI analyzes:

- Emotional Tone
- Sentiment
- Stress Indicators
- Mood Trends

---

## 👥 Community Insights

Anonymous community wellbeing analytics including:

- Mood Distribution
- Community Wellbeing Trends
- Stress Level Insights

No personal information is exposed.

---

# 🧠 AI Decision Intelligence

WellWish AI is not just a tracker.

It is an **AI Decision Intelligence Platform**.

Instead of simply displaying data, the platform compares:

Today's Data

↓

Historical Check-ins

↓

Journal Reflections

↓

Lifestyle Patterns

↓

Stress Trends

↓

Personalized AI Recommendations

The AI explains why wellbeing changes and suggests practical next steps.

---

# 🌟 Explainable AI

Every wellbeing score is generated transparently.

Example:

Today's Wellbeing Index: **78/100**

Contributing Factors:

- Positive journal sentiment
- Good hydration
- Reduced sleep
- Moderate work pressure
- Lower physical activity

This builds user trust and transparency.

---

# 🔒 Privacy First

WellWish AI prioritizes user privacy.

- JWT Authentication
- Password Hashing
- Secure API Communication
- Protected User Data
- Anonymous Community Statistics

The platform provides wellbeing guidance and is **not intended to diagnose, treat, or replace professional medical advice.**

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend

- FastAPI
- Python
- SQLAlchemy
- SQLite
- JWT
- Bcrypt

## Artificial Intelligence

- Google Gemini API
- Prompt Engineering
- AI Sentiment Analysis
- Decision Intelligence

---

# 🏗 Project Architecture

```
                 User
                   │
                   ▼
         React Frontend (Vite)
                   │
             Axios API Calls
                   │
                   ▼
            FastAPI Backend
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
Authentication   SQLite DB   Gemini AI
     │             │             │
     └─────────────┼─────────────┘
                   ▼
       AI Decision Intelligence
                   │
                   ▼
      Personalized Wellbeing Dashboard
```

---

# 📂 Project Structure

```
WellWish-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── render.yaml
│
└── README.md
```

---

# ⚙ Installation

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

Example:

```
GEMINI_API_KEY=YOUR_API_KEY
SECRET_KEY=YOUR_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

# 🚀 Future Scope

- Google Fit Integration
- Apple Health Integration
- Fitbit Integration
- Voice Emotion Analysis
- Facial Emotion Recognition (with user consent)
- Smart Notifications
- Weekly AI Wellness Reports
- Multilingual AI Coach
- Predictive Burnout Forecasting

---

# 🎯 Impact

WellWish AI can benefit:

- Students
- Employees
- Remote Workers
- Educational Institutions
- Corporate Wellness Programs
- Community Health Initiatives

---

# 📸 Screenshots

_Add screenshots of the Landing Page, Dashboard, Daily Check-in, Journal, and Willa AI here._

---

# 🎥 Demo

Demo Video: *(Add your video link after uploading.)*

---

# 🌐 Deployment

Frontend: *(Add Vercel link)*

Backend API: *(Add Render link)*

---

# 👩‍💻 Team

**Project Name:** WellWish AI

Developed for the **AI for Better Living and Smarter Communities Hackathon**

---

# 📄 License

This project was developed for educational and hackathon purposes.
