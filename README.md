# 🏋️ AI Fitness Trainer

A full-stack, AI-powered fitness application built with **React + Vite**, **Node.js + Express**, and a **FastAPI Python microservice** for real-time pose detection and ML predictions.

---

## 🗂️ Project Structure

```
ai-fitness-trainer/
├── client/             # React + Vite + Tailwind CSS frontend
├── server/             # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── controllers/    # Business logic (MVC)
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── middleware/     # auth, authorize, validate, errorHandler
│   │   ├── services/       # (future: email, notification services)
│   │   ├── utils/          # streakHelper, apiResponse
│   │   └── config/         # db.js
│   └── uploads/            # Static file uploads
├── ai-models/          # FastAPI Python microservice
│   ├── api/            # FastAPI app (main.py)
│   ├── models/         # Saved .pkl model files (generated)
│   ├── pose/           # MediaPipe pose detection modules
│   ├── training/       # Model training scripts
│   ├── datasets/       # Dataset docs / CSV files
│   └── utils/          # Shared Python helpers
├── .env.example        # Environment variable template
├── package.json        # Root orchestration scripts
└── docker-compose.yml  # Docker full-stack setup
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB (local or Atlas)

### 1 — Install dependencies

```bash
# JavaScript (root + server + client)
npm run setup

# Python AI service
npm run setup:py
# or: pip install -r ai-models/requirements.txt
```

### 2 — Set environment variables

```bash
# Create server/.env
cp .env.example server/.env   # then edit values

# Create client/.env
cp .env.example client/.env   # then edit values
```

### 3 — Train ML models (one time)

```bash
npm run train
# Generates: ai-models/models/workout_rf.pkl  bmi_lr.pkl  calories_lr.pkl  label_encoders.pkl
```

### 4 — Run everything (dev)

```bash
npm run dev
```

This starts three services concurrently:
| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:3000 |
| Backend (Express) | http://localhost:5000 |
| AI Service (FastAPI) | http://localhost:8000 |
| AI API Docs | http://localhost:8000/docs |

---

## 🔌 API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Login, returns JWT |
| GET | `/me` | Get current user (auth required) |
| POST | `/forgot-password` | Generate reset token |
| PUT | `/reset-password/:token` | Reset password |

### Workouts — `/api/workouts`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List user workouts |
| POST | `/` | Save a workout |
| GET | `/recommend` | AI workout plan (proxies to FastAPI) |
| GET | `/:id` | Get single workout |
| DELETE | `/:id` | Delete workout |

### BMI & Metrics — `/api/metrics`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List body metrics history |
| POST | `/` | Save measurement (BMI auto-calculated) |
| POST | `/predict-bmi` | AI BMI prediction |

### Calories — `/api/calories`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Last N days calorie logs |
| POST | `/log` | Log today's calories/meals |
| POST | `/predict` | AI calorie burn prediction |

### Diet — `/api/diet`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Saved diet plans |
| POST | `/recommend` | AI diet plan + macros |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Aggregated dashboard data |

### Users — `/api/users`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile |
| GET | `/` | List all users (admin only) |
| DELETE | `/:id` | Delete user (admin only) |

### AI Service — `http://localhost:8000`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health |
| POST | `/predict/workout` | Random Forest workout plan |
| POST | `/predict/bmi` | BMI classification |
| POST | `/predict/calories` | Calorie burn estimation |
| POST | `/pose/analyze-frame` | Single-frame posture score |
| WS | `/pose/stream` | Real-time rep counter (WebSocket) |

---

## 🗄️ Database Collections

| Collection | Description |
|-----------|-------------|
| `users` | Accounts, profiles, streaks, roles |
| `workouts` | Saved workout sessions + exercises |
| `bodymetrics` | Weight, BMI, body composition history |
| `calorielogs` | Daily calorie consumed/burned + meals |
| `dietplans` | AI-generated diet suggestions + macros |
| `progress` | Daily aggregated progress snapshots |

---

## 🧠 AI Models

| Model | Algorithm | Input | Output |
|-------|-----------|-------|--------|
| Workout Planner | Random Forest | age, weight, height, goal, activity, fitness | exercise plan |
| BMI Classifier | Logistic Regression | weight, height, age, gender | BMI category |
| Calorie Predictor | Linear Regression | exercise type, duration, intensity, weight | kcal burned |
| Pose Detection | MediaPipe + OpenCV | video frame | landmarks, rep count, posture score |

---

## 🔐 Authentication & Roles

- JWT tokens (7d expiry, configurable via `JWT_EXPIRE`)
- `role: 'user'` (default) or `role: 'admin'`
- Admin routes are protected with `authorize('admin')` middleware
- All passwords hashed with bcrypt (12 salt rounds)

---

## 🐳 Docker

```bash
docker-compose up --build
```

---

## 🌐 Deployment

### Backend → Render
1. Create a **Web Service** pointing to `server/`
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables from `.env.example`

### Frontend → Vercel
1. Import the repo, set **Root Directory** to `client/`
2. Vercel auto-detects Vite. Done.

### AI Service → Render (Python)
1. Create a **Web Service** pointing to `ai-models/`
2. Build: `pip install -r requirements.txt && python training/train_models.py`
3. Start: `uvicorn api.main:app --host 0.0.0.0 --port 8000`

---

## 🤝 Contributing

PRs welcome! Please open an issue first for major changes.
