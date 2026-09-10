# HarvestPredict

**Predict. Plan. Harvest Smarter.**

AI-Powered Crop Yield Prediction & Harvest Forecasting Platform - Professional portfolio project demonstrating full-stack (MERN + FastAPI + ML) agriculture decision-support software.

---

## ⚠️ Project Status

**This project is a Work in Progress (WIP).**

Development Phases:
- ✅ ML Service - FastAPI prediction engine with trained models
- ✅ Backend - Node.js/Express REST API with MongoDB
- 🔄 Frontend - React + TypeScript UI (in progress)

---

## Monorepo Structure

```
HarvestPredict/
├── client/       # React + TS + Tailwind frontend
├── server/       # Node.js + Express + MongoDB backend
├── ml-service/   # Python + FastAPI ML prediction service
└── docs/         # Documentation
```

---

## Quick Start with Docker Compose

The easiest way to run the entire platform is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd HarvestPredict
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Build and start all services:
```bash
docker-compose up --build
```

4. Access the services:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **ML Service API:** http://localhost:8000/docs
- **MongoDB:** localhost:27017

5. Stop all services:
```bash
docker-compose down
```

To persist MongoDB data between restarts, Docker Compose automatically manages the `mongo-data` named volume.

---

## Local Development (Without Docker)

If you prefer running services directly on your machine:

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (running locally or use MongoDB Atlas)
- pip and npm/yarn

### Step 1: Set up environment variables
```bash
cp .env.example .env
# Edit .env with your local configuration
```

### Step 2: Start MongoDB
Ensure MongoDB is running on `localhost:27017` or update `MONGO_URI` in `.env`.

### Step 3: Start ML Service
```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
ML Service runs at http://localhost:8000 (API docs at /docs)

### Step 4: Start Backend Server
```bash
cd server
npm install
npm run dev  # or node server.js
```
Backend runs at http://localhost:5000

### Step 5: Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Frontend runs at http://localhost:5173 (Vite default)

---

## Architecture

```
┌───────────┐     HTTP/REST      ┌───────────┐     MongoDB      ┌───────────┐
│  Client   │ ──────────────────▶│  Server   │ ────────────────▶│  MongoDB  │
│  (React)  │                    │ (Express) │                  │           │
└───────────┘                    └─────┬─────┘                  └───────────┘
                                       │
                                       │ HTTP/REST
                                       ▼
                                ┌─────────────┐
                                │  ML Service │
                                │  (FastAPI)  │
                                └──────┬──────┘
                                       │
                                       │ Load
                                       ▼
                                ┌─────────────┐
                                │  ML Model   │
                                │ (joblib)    │
                                └─────────────┘
```

**Data Flow:**
1. User interacts with the React frontend (client)
2. Client sends API requests to the Express backend server
3. Server handles authentication, business logic, and CRUD operations with MongoDB
4. For yield predictions, Server forwards feature data to the ML Service (FastAPI)
5. ML Service loads the pre-trained model and preprocessor, then returns predictions
6. Server aggregates results and sends responses back to the Client

---

## Features

- **AI Yield Prediction** - Machine learning model predicts crop yields based on soil, weather, and agricultural inputs
- **User Authentication** - JWT-based secure registration and login
- **Prediction History** - Save and retrieve past prediction records
- **Dashboard Analytics** - Visualize trends, insights, and prediction distributions
- **Feature Importance** - Understand which factors most influence yield outcomes
- **Harvest Forecasting** - Plan harvest timelines based on predicted yields
- **Responsive UI** - Modern, responsive interface built with Tailwind CSS
- **RESTful APIs** - Clean, documented APIs for backend and ML services

---

## Tech Stack

### Frontend (`client/`)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Context API** - State management (Auth)
- **React Router** - Client-side routing

### Backend (`server/`)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication & authorization
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### ML Service (`ml-service/`)
- **Python 3.10+** - Runtime
- **FastAPI** - Modern, fast web framework
- **Uvicorn** - ASGI server
- **Scikit-learn** - ML algorithms & preprocessing
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Joblib** - Model serialization
- **Pydantic** - Data validation

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **MongoDB 6** - Database container

---

## Data Honesty Notice

This project uses a **synthetic dataset** (`ml-service/data/synthetic_agri_dataset.csv`) for training and demonstration purposes. The agricultural data is artificially generated and labeled as synthetic. Predictions and insights produced by this platform are for portfolio demonstration only and should **not** be used for real-world agricultural decision-making.

For production use, this platform would require integration with verified agricultural datasets, weather APIs, soil testing data, and localized agronomic models from trusted sources.

---

## License

This project is created for portfolio demonstration purposes.
