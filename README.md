
# Smart Knowledge Assistant

A full-stack AI application that compares general AI responses with
answers grounded in a local company policy document. It includes
document retrieval, response evaluation, consistency testing, and
performance comparison.

## Features

- Direct AI answers using Gemini
- Retrieval-Augmented Generation (RAG)
- Local company policy retrieval
- Context-aware answers with an unsupported-information fallback
- Retrieval evaluation
- AI answer evaluation using expected facts
- Repeated-answer consistency testing
- Direct AI vs RAG comparison
- Latency and token-usage metrics
- React frontend and Express REST API

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- Google GenAI SDK

**AI and retrieval**
- Gemini API
- Keyword-based document retrieval
- Context-grounded prompt generation
- Rule-based evaluation

## Architecture

1. The user submits a question through the React interface.
2. The frontend sends an HTTP request to the Express API.
3. Direct mode sends the question to Gemini.
4. RAG mode retrieves relevant sections from the local policy file.
5. The backend builds a prompt using the retrieved context.
6. Gemini generates a context-grounded answer.
7. The API returns the answer, retrieved sections, latency,
   and available token-usage information.
8. Evaluation endpoints test retrieval, expected facts,
   and response consistency.

## Project Structure

```text
smart-knowledge-assistant/
├── README.md
├── .gitignore
├── frontend/
│   └── src/
│       ├── components/
│       ├── services/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
└── backend/
    ├── data/
    │   └── companyPolicy.txt
    ├── src/
    │   ├── routes/
    │   │   ├── assistantRoutes.js
    │   │   └── evaluationRoutes.js
    │   ├── services/
    │   │   ├── aiService.js
    │   │   ├── retrievalService.js
    │   │   ├── promptService.js
    │   │   └── evaluationService.js
    │   └── app.js
    ├── server.js
    ├── package.json
    ├── .env.example
    └── .env
```

The `.env` file is local configuration and must not be committed.

## Prerequisites

- Node.js and npm
- A Gemini API key
- Internet access for Gemini API requests

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/sreelakshmipm02/smart-knowledge-assistant.git
cd smart-knowledge-assistant
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create `backend/.env` using `.env.example` as a template.

```env
PORT=5001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

GEMINI_API_KEY=your_actual_api_key
GEMINI_MODEL=gemini-3.8-flash
MAX_CONTEXT_CHARS=3000
MAX_OUTPUT_TOKENS=400
```

Replace the API key placeholder with your own key.
Never share or commit the real key.

Use a model name supported by your Gemini API account.

### 4. Start the backend

```bash
npm run dev
```

Use the start command defined in `backend/package.json`
if it differs.

### 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

http://localhost:5173

If necessary, configure `VITE_API_URL` to point to the backend API.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/direct` | Generate a general AI answer |
| POST | `/api/rag` | Generate an answer using retrieved policy context |
| POST | `/api/evaluation/tests` | Run retrieval-focused tests |
| POST | `/api/evaluation/run` | Run AI answer evaluation |
| POST | `/api/evaluation/consistency` | Compare repeated answers |

### Example request

`POST /api/rag`

```json
{
  "question": "How many casual leave days are allowed?"
}
```

A successful response includes the answer, retrieved documents,
context information, latency, model information, and available
token-usage metrics.

The exact response fields depend on the endpoint and whether
relevant context was found.

## Evaluation Methodology

### Retrieval evaluation
Checks whether the expected policy section is retrieved.

### Answer evaluation
Checks generated answers against expected facts using
predefined validation patterns.

### Consistency evaluation
Repeats a question and compares the returned answer strings.
Exact string matching is a simple consistency measure; it does
not prove factual correctness.

### Direct vs RAG comparison
Compares direct and context-grounded answers for a known
policy question. It records expected-fact checks, latency,
and available token usage.

### Limitations
- Keyword-based retrieval can miss relevant sections.
- Rule-based checks cannot evaluate every aspect of answer quality.
- Repeated answers may differ in wording without differing in meaning.
- Latency and token usage vary between requests.
- The local policy document is fictional demonstration data.

## Security Notes

- Keep API keys in environment variables.
- Never commit `.env` or expose API keys in frontend code.
- Restrict CORS to trusted frontend origins.
- Avoid returning internal error details in production.
- Do not use demonstration policy content as real company policy.

## Future Improvements

- Semantic search using embeddings
- Vector database integration
- Reranking retrieved sections
- Source-level citations in answers
- More evaluation datasets and semantic metrics
- Authentication, rate limiting, and production monitoring

## Author

Sreelakshmi P M
