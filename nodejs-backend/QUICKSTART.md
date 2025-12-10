# Quick Start Guide - Node.js Backend

## ✅ Backend is Ready!

Your Node.js/TypeScript backend is now set up and running!

## 🚀 Current Status

- ✅ Server running on: **http://localhost:8000**
- ✅ Health check: **http://localhost:8000/health**
- ✅ All endpoints configured
- ⚠️ **Need to add Gemini API key**

## 🔑 Add Your Gemini API Key

**Step 1:** Get your API key from: https://aistudio.google.com/apikey

**Step 2:** Edit the `.env` file:
```bash
nano .env
```

**Step 3:** Replace `your-api-key-here` with your actual key:
```env
GEMINI_API_KEY=AIzaSy...your-actual-key
```

**Step 4:** Save the file - the server will auto-reload!

## 📡 Available Endpoints

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. List Directories (Browse Folders)
```bash
curl -X POST http://localhost:8000/list-directories \
  -H "Content-Type: application/json" \
  -d '{"path":""}'
```

### 3. Check Repository
```bash
curl -X POST http://localhost:8000/check-repo \
  -H "Content-Type: application/json" \
  -d '{"path":"/home/puni/your-repo"}'
```

### 4. Compare Branches
```bash
curl -X POST http://localhost:8000/compare-branches \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/home/puni/your-repo",
    "base_branch": "main",
    "compare_branch": "develop"
  }'
```

### 5. Summarize PR (Upload diff file)
```bash
curl -X POST http://localhost:8000/summarize-pr \
  -F "file=@/path/to/your.diff"
```

## 🛠️ Commands

```bash
# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Run production
npm start

# Stop the server
Ctrl + C
```

## 📂 Project Structure

```
nodejs-backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── gitController.ts
│   ├── routes/               # API routes
│   │   └── index.ts
│   ├── services/             # Business logic
│   │   ├── geminiService.ts  # Gemini AI integration
│   │   └── gitService.ts     # Git operations
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── index.ts              # Main entry point
├── uploads/                  # Temporary uploads
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## 🔄 Frontend Integration

The frontend is already configured to connect to this backend on port 8000. No changes needed!

Just make sure both are running:
- Backend: `http://localhost:8000` ✅
- Frontend: `http://localhost:5173` (Vite dev server)

## 📝 Notes

- The server uses **TypeScript** for type safety
- **Auto-reload** enabled in development mode
- **CORS** is enabled for frontend communication
- Files are temporarily stored in `uploads/` directory
- **Gemini 1.5 Flash** model is used for fast AI responses (better free tier support)

## 🐛 Troubleshooting

**Server won't start?**
- Check if port 8000 is available: `lsof -i :8000`
- Kill existing process: `lsof -ti:8000 | xargs kill`

**API key error?**
- Make sure GEMINI_API_KEY is set in `.env`
- Check the key is valid (not 'your-api-key-here')
- Restart the server after changing `.env`

**Git operations failing?**
- Ensure Git is installed: `git --version`
- Check repository path is correct
- Verify you have read permissions

## 🎯 Next Steps

1. ✅ Add your Gemini API key to `.env`
2. ✅ Test the endpoints
3. ✅ Connect the frontend
4. 🚀 Start using SummarAIze!

Enjoy coding! 🎉

