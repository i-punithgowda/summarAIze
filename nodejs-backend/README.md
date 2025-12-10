# SummarAIze - Node.js Backend

A Node.js/TypeScript backend for SummarAIze - Git Assistant with AI-powered summaries using Google Gemini.

## Features

- 📁 **Interactive Folder Browser** - Browse and select Git repositories
- 🔍 **Git Repository Analysis** - Detect and analyze Git repositories
- 🔀 **Branch Comparison** - Compare branches and get AI-powered summaries
- 📝 **PR Summarization** - Upload diff files and get intelligent summaries
- 🤖 **Google Gemini AI Integration** - Powered by Gemini 2.0 Flash

## Project Structure

```
nodejs-backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── services/         # Business logic (Git, Gemini AI)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Entry point
├── dist/                 # Compiled JavaScript (generated)
├── uploads/              # Temporary file uploads
├── package.json
├── tsconfig.json
└── .env
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Git installed on your system
- Google Gemini API Key ([Get it here](https://aistudio.google.com/apikey))

### Installation

```bash
cd nodejs-backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env and add your Gemini API key
nano .env
```

### Environment Variables

Edit `.env` file:

```env
PORT=8000
NODE_ENV=development
GEMINI_API_KEY=your-actual-api-key-here
```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Endpoints

### 1. List Directories
**POST** `/list-directories`
```json
{
  "path": "/home/user/projects"  // optional, defaults to home directory
}
```

### 2. Check Repository
**POST** `/check-repo`
```json
{
  "path": "/home/user/projects/my-repo"
}
```

### 3. Compare Branches
**POST** `/compare-branches`
```json
{
  "path": "/home/user/projects/my-repo",
  "base_branch": "main",
  "compare_branch": "feature/new-feature"
}
```

### 4. Summarize PR
**POST** `/summarize-pr`
- Content-Type: `multipart/form-data`
- Body: `file` (diff file)

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Git Operations**: simple-git
- **AI**: Google Gemini AI (@google/generative-ai)
- **File Upload**: Multer
- **CORS**: Enabled for development

## Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Testing

You can test the API using:
- **Swagger/OpenAPI**: Visit `http://localhost:8000/docs` (if implemented)
- **curl**: Use command line
- **Postman**: Import the endpoints
- **Frontend**: The React frontend connects automatically

## Example Usage

```bash
# Test health check
curl http://localhost:8000/health

# List directories
curl -X POST http://localhost:8000/list-directories \
  -H "Content-Type: application/json" \
  -d '{"path": ""}'

# Check repository
curl -X POST http://localhost:8000/check-repo \
  -H "Content-Type: application/json" \
  -d '{"path": "/path/to/your/repo"}'
```

## Notes

- Make sure to set your `GEMINI_API_KEY` before running
- The server runs on port 8000 by default
- CORS is enabled for all origins in development mode
- Uploaded files are temporarily stored in `uploads/` and cleaned up after processing

## License

MIT

