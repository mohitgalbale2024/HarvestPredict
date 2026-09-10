# HarvestPredict Architecture

## Overview

HarvestPredict implements a **4-tier, service-oriented architecture** designed for separation of concerns, scalability, and independent deployment of each component. Each tier has a single responsibility and communicates with adjacent tiers through well-defined interfaces (HTTP/REST APIs).

---

## 4-Tier Architecture

### Tier 1: Presentation Layer — Client (React + TypeScript)
**Responsibility:** User interface and client-side logic

- Serves the web UI to end-users via browser
- Handles user interactions, form inputs, and navigation
- Manages client-side state (authentication context, UI state)
- Validates user input before sending to the backend
- Renders data visualizations and prediction results
- Communicates exclusively with Tier 2 (Server) via REST API calls

**Technology:** React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router

---

### Tier 2: Application Layer — Server (Node.js + Express)
**Responsibility:** Business logic, orchestration, authentication, and data persistence API

- Acts as the central gateway for all client requests
- Implements user authentication and authorization (JWT-based)
- Enforces business rules and input validation
- Manages CRUD operations against Tier 4 (MongoDB)
- Orchestrates prediction workflows by calling Tier 3 (ML Service)
- Transforms and aggregates data between ML output format and client contracts
- Handles CORS, error handling, and logging

**Technology:** Node.js, Express.js, Mongoose, JWT, Bcrypt

---

### Tier 3: Inference Layer — ML Service (Python + FastAPI)
**Responsibility:** Machine learning prediction serving and feature processing

- Exposes a dedicated prediction API separate from the web backend
- Loads pre-trained ML model and preprocessing pipeline from disk
- Accepts raw agricultural feature vectors (soil metrics, weather, inputs)
- Applies consistent preprocessing (scaling, encoding) matching training pipeline
- Runs inference through the trained regression model
- Returns predicted yield values alongside feature importance scores
- Stateless — no database; operates purely on input data and loaded model artifacts

**Technology:** FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, Joblib, Pydantic

---

### Tier 4: Data Layer — MongoDB
**Responsibility:** Persistent storage of application data

- Stores user accounts (hashed credentials, profile metadata)
- Stores prediction history records (input features, outputs, timestamps, user ownership)
- Supports queries for analytics, dashboards, and historical lookups
- Schema enforced through Mongoose models on Tier 2

**Technology:** MongoDB 6.x, Mongoose ODM

---

## Data Flow

### Sequence: User Authentication
```
Client (React)          Server (Express)         MongoDB
     │                       │                      │
     │── POST /api/register ─▶│                      │
     │   (email, password)    │                      │
     │                       │── hash password ──▶   │
     │                       │   + create user doc   │
     │                       │◀──── save success ───│
     │◀──── JWT token ───────│                      │
     │                       │                      │
```

### Sequence: Yield Prediction
```
Client (React)          Server (Express)         ML Service (FastAPI)        Model Artifacts
     │                       │                           │                       │
     │── POST /api/predict ─▶│                           │                       │
     │   (agricultural       │                           │                       │
     │    features + JWT)    │                           │                       │
     │                       │── verify JWT              │                       │
     │                       │── validate features ──▶   │                       │
     │                       │   POST /predict           │                       │
     │                       │                           │── load preprocessor ──▶│
     │                       │                           │── transform features   │
     │                       │                           │── load model ─────────▶│
     │                       │                           │── run inference        │
     │                       │                           │── compute importance   │
     │                       │◀── prediction + scores ──│                       │
     │                       │── save prediction ────────────────────────────▶ MongoDB
     │                       │   to history collection   │                       │
     │◀── prediction result ─│                           │                       │
     │                       │                           │                       │
```

### Sequence: Dashboard & History
```
Client (React)          Server (Express)         MongoDB
     │                       │                      │
     │── GET /api/dashboard ─│                      │
     │   (JWT in headers)    │                      │
     │                       │── verify JWT          │
     │                       │── fetch user preds ──▶│
     │                       │── aggregate stats    │
     │                       │── generate insights  │
     │◀── dashboard data ────│                      │
     │                       │                      │
```

---

## Inter-Service Communication

| From → To         | Protocol | Port (Local) | Port (Docker) | Endpoints               | Auth   |
|-------------------|----------|--------------|---------------|-------------------------|--------|
| Client → Server   | HTTP/REST| 5000         | 5000          | `/api/*`                | JWT    |
| Server → ML       | HTTP/REST| 8000         | 8000          | `/predict`, `/health`   | None*  |
| Server → MongoDB  | Native   | 27017        | 27017         | `harvestpredict` DB     | None*  |

\* In production environments, these internal services should be protected by network isolation (private subnets) and internal authentication. In Docker Compose, they run on an isolated bridge network (`harvestpredict-network`) and are not directly exposed beyond the host unless ports are mapped.

---

## Container Network Topology (Docker Compose)

All services are attached to a dedicated user-defined bridge network `harvestpredict-network`:

```
host machine
  │
  ├─ port 3000 ──► client container ────┐
  │                                     │
  ├─ port 5000 ──► server container ────┤◄── harvestpredict-network (bridge)
  │                                     │
  ├─ port 8000 ──► ml-service container│
  │                                     │
  └─ port 27017 ► mongodb container ────┘
          (mongo-data named volume persisted on host)
```

---

## Design Decisions & Rationale

1. **Separate ML Service (Tier 3) from Backend (Tier 2)**
   - ML inference is CPU/memory-intensive and should scale independently
   - Python ecosystem provides best-in-class ML libraries vs Node.js
   - Enables swapping/upgrading ML stack without affecting backend
   - Allows future deployment of ML service on GPU instances

2. **Server as Gateway / Orchestrator**
   - Single entry point for client simplifies security (one auth layer exposed)
   - Central place to implement rate limiting, caching, and business rules
   - Abstracts ML Service internals from the frontend — ML API is not publicly exposed

3. **Stateless ML Service**
   - No DB dependency means fast horizontal scaling and simple deployments
   - Model versioning can be handled via CI/CD by updating container image or mounted volume

4. **MongoDB for Data Layer**
   - Flexible schema suits evolving prediction feature sets and metadata
   - Mongoose provides schema validation and data modeling on the application side
   - Native JSON/BSON alignment with REST payloads reduces transformation overhead
