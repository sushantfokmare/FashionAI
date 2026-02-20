# FashionAI Backend (Express + MongoDB Atlas + JWT)

## Quick start (Atlas - Option B)
1. Create a free MongoDB Atlas cluster (M0) and a Database User (username/password).
2. Network Access: Allow your IP (or 0.0.0.0/0 for dev only).
3. Copy `backend/.env.example` to `backend/.env` and set:
   - `MONGO_URI` to your Atlas connection string, e.g.
     `mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/fashionai?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET` to a strong random string
   - `CLIENT_ORIGIN=http://localhost:5173`
   - `COOKIE_SECURE=false` for local dev
4. Install and run:
```powershell
cd backend
npm install
npm run dev
```
5. Sanity checks:
   - GET http://localhost:5000/health → { status: "ok" }
   - POST http://localhost:5000/api/auth/signup with JSON { name, email, password }
   - POST http://localhost:5000/api/auth/login with JSON { email, password }
   - Include credentials in frontend requests so the httpOnly cookie is stored.

## Endpoints
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me (auth)
- GET  /api/user/profile (auth)
- POST /api/ai/generate (proxy to Python AI service)
- GET  /api/ai/health (check AI service status)
- GET  /api/ai/images/list (list generated images)

## AI Service Integration
This backend proxies AI generation requests to a Python FastAPI service.
See [AI_INTEGRATION.md](AI_INTEGRATION.md) for details.

**Required:** Python AI service must be running on http://localhost:8000

Notes:
- No Atlas API key is needed for app connections; the URI embeds the DB user credentials.
- Turn `COOKIE_SECURE=true` only when your site is served over HTTPS.
- Add `AI_SERVICE_URL=http://localhost:8000` to your `.env` file
# Backend

This folder is reserved for the server/backend code.

Suggested next steps:
- Initialize a Node/Express app here or set up your preferred backend framework.
- Keep frontend client in `../frontend`.
- Use separate package.json and environment files for backend.
