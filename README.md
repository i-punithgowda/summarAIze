# SummarAIze

A full-stack app to upload PR diffs or zips and get AI-generated summaries and suggestions.

## Setup

### Prerequisites
- Docker & Docker Compose

### Run with Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Local Development

#### Backend
```bash
cd backend/app
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Usage

1. Go to the frontend in your browser.
2. Upload a `.zip` (containing two files to diff) or a `.diff` file.
3. Get a summary and suggestions!

---

## Notes

- The backend currently uses a stub for AI summary. Integrate with your LLM as needed.
- CORS is enabled for development. 