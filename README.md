# TechKraft Candidate Dashboard

This is an internal candidate scoring and review dashboard built for the TechKraft recruitment workflow. It features a FastAPI backend and a React/Vite frontend.

## Setup and Run Instructions

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Environment Setup
1. Copy the `.env.example` to `.env` in the root directory (if provided). Note: there are no sensitive credentials committed.
2. In the `apps/web` directory, a `.env` file should be present or can be created containing:
   ```
   VITE_API_URL=http://localhost:8000
   ```

### Running the Application
To start both the frontend and the backend using Docker Compose, run:
```bash
docker-compose up --build
```

- **Backend API**: Running on [http://localhost:8000](http://localhost:8000)
- **Frontend Dashboard**: Running on [http://localhost:5173](http://localhost:5173)

You can register as a new reviewer via the `/auth/register` UI.

---

## Example API Calls

### 1. Register a New Reviewer
```bash
curl -X 'POST' \
  'http://localhost:8000/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "full_name": "Test Reviewer",
  "email": "reviewer@example.com",
  "username": "reviewer1",
  "password": "password123"
}'
```

### 2. Login
```bash
curl -X 'POST' \
  'http://localhost:8000/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "reviewer@example.com",
  "password": "password123"
}'
```

### 3. List Candidates
*Replace `<YOUR_TOKEN>` with the `access_token` returned from the login endpoint.*
```bash
curl -X 'GET' \
  'http://localhost:8000/candidates?limit=20&offset=0' \
  -H 'Authorization: Bearer <YOUR_TOKEN>'
```

---

## Architecture Decision Record (ADR)

### 1. Centralized Axios Instance with Interceptor for Auth
- **Context:** The frontend needed a way to attach JWT tokens to API requests without manually adding the token in every component or API call.
- **Decision:** I used a centralized Axios instance (`api/client.ts` or `lib/instance.ts`) with a request interceptor that automatically reads the token from `localStorage` and appends it as a Bearer token.
- **Trade-off:** This ties the auth logic slightly to Axios and `localStorage`. However, it ensures token presence across all queries consistently with minimal boilerplate.

### 2. Role-Based Data Filtering on the Backend
- **Context:** Reviewers should only see their own candidate scores, while admins should see all scores.
- **Decision:** I placed the score filtering logic in the backend (`GET /candidates/{id}`) rather than filtering on the frontend.
- **Trade-off:** The frontend receives pre-filtered data, meaning it doesn't have access to global statistics (unless an admin requests it). This is more secure and minimizes data exposure, although it prevents reviewers from seeing aggregate stats like "total number of scores submitted" for a candidate.

### 3. Tailwind CSS + Minimal Custom UI over Component Libraries
- **Context:** The requirement was a fast, clean, responsive, and user-friendly interface.
- **Decision:** Given the existing partial Shadcn setup, I opted to build custom list and detail pages using utility classes (Tailwind CSS) instead of pulling in heavy table or complex components.
- **Trade-off:** It required writing some custom markup for tables and layouts but resulted in a highly optimized, custom-designed, premium look without bloated dependencies.

---

## Debugging Signal: Identify the Issue

**The Bug Snippet:**
```python
def search_candidates(status: str, keyword: str, page: int, page_size: int):
    all_candidates = db.execute("SELECT * FROM candidates").fetchall()
    filtered = [c for c in all_candidates if c["status"] == status]
    # ... also filter by keyword in Python ...
    offset = (page - 1) * page_size
    return filtered[offset : offset + page_size]
```

**Issue & Why it Matters at Scale:**
The issue is that the code is retrieving **all records** from the `candidates` table into memory before performing filtering and pagination in Python. At scale (e.g., thousands or millions of candidates), fetching the entire dataset into memory will lead to high latency, out-of-memory errors on the server, and massive network bandwidth overhead between the application and the database.

**Correct Approach:**
Filtering and pagination should be pushed down to the database using SQL queries. The correct query would utilize `WHERE` clauses for filtering and `LIMIT` / `OFFSET` for pagination.
```python
def search_candidates(status: str, keyword: str, page: int, page_size: int):
    offset = (page - 1) * page_size
    query = """
        SELECT * FROM candidates 
        WHERE status = :status 
          AND (name LIKE :keyword OR email LIKE :keyword)
        LIMIT :page_size OFFSET :offset
    """
    return db.execute(query, {
        "status": status,
        "keyword": f"%{keyword}%",
        "page_size": page_size,
        "offset": offset
    }).fetchall()
```

---

## Learning Reflection

During this assignment, I successfully integrated and handled loading states for mock async LLM summary generations within React Query. Given more time, I would explore implementing the Server-Sent Events (SSE) stretch goal (`GET /candidates/{id}/stream`) to broadcast real-time score updates to connected clients using FastAPI's `StreamingResponse` and React's `EventSource`.
