# AI Playground

Autonomous AI Data Scientist Playground — a full-stack app with a Python/FastAPI backend and a React/Vite frontend.

## Prerequisites

- Python 3.11+
- Node.js 18+

## Running the App

You need to run the backend and frontend in **separate terminals**.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

Runs on http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173
