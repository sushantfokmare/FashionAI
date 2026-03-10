 # 🚀 Hybrid Deployment Guide (FREE)

Deploy Frontend + Backend to cloud, AI Service stays on your PC.

---

## 📋 What You Have

✅ **Ngrok URL for AI Service**: `https://interlinearly-intergular-adolfo.ngrok-free.dev`  
✅ **JWT Secret**: `YWFw6oucFpraSKESFJafL3VhuD/M+NX6aFLY7SMwI53qxKRJfG7OvHpn+UFNnNHgRqv1QJuXLQN++N1LzPsYsA==`

---

## 🎯 Deployment Checklist

### Step 1: Setup MongoDB Atlas (5 minutes) ✓

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Click "Try Free" and sign up

2. **Create Free Cluster**
   - Choose "FREE" (M0) tier
   - Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: `fashionai-cluster`
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" (left menu)
   - Click "Add New Database User"
   - Username: `fashionai_user`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Allow Network Access**
   - Go to "Network Access" (left menu)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left menu)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string, it looks like:
   ```
   mongodb+srv://fashionai_user:<password>@fashionai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with the password you saved
   - Add database name at the end:
   ```
   mongodb+srv://fashionai_user:YOUR_PASSWORD@fashionai-cluster.xxxxx.mongodb.net/fashionai?retryWrites=true&w=majority
   ```

**SAVE THIS CONNECTION STRING!** You'll need it for Render.

---

### Step 2: Deploy Backend to Render (5 minutes) ✓

1. **Push Code to GitHub** (if not already)
   ```powershell
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Render**
   - Visit: https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Click "Connect account" to connect GitHub
   - Find and select your repo: `sushantfokmare/FashionAI`
   - Click "Connect"

4. **Configure Service**
   ```
   Name: fashionai-backend
   Region: Oregon (or closest to you)
   Branch: main
   Root Directory: project/backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add these one by one:
   ```
   NODE_ENV = production
   PORT = 5000
   AI_SERVICE_URL = https://interlinearly-intergular-adolfo.ngrok-free.dev
   JWT_SECRET = YWFw6oucFpraSKESFJafL3VhuD/M+NX6aFLY7SMwI53qxKRJfG7OvHpn+UFNnNHgRqv1QJuXLQN++N1LzPsYsA==
   MONGODB_URI = mongodb+srv://fashionai_user:YOUR_PASSWORD@fashionai-cluster.xxxxx.mongodb.net/fashionai?retryWrites=true&w=majority
   CLIENT_ORIGIN = http://localhost:3000
   ```
   
   (We'll update CLIENT_ORIGIN after frontend is deployed)

6. **Create Web Service**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Once deployed, copy the URL (e.g., `https://fashionai-backend.onrender.com`)

**SAVE YOUR BACKEND URL!**

---

### Step 3: Deploy Frontend to Vercel (5 minutes) ✓

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Find your repo: `sushantfokmare/FashionAI`
   - Click "Import"

3. **Configure Project**
   ```
   Project Name: fashionai-studio
   Framework Preset: Vite
   Root Directory: project/frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click "Add" under "Environment Variables"
   
   Add these:
   ```
   Name: VITE_API_URL
   Value: https://fashionai-backend.onrender.com
   
   Name: VITE_AI_SERVICE_URL
   Value: https://fashionai-backend.onrender.com/ai
   ```
   
   Note: AI requests will go through backend, which proxies to your ngrok URL

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Once deployed, copy the URL (e.g., `https://fashionai-studio.vercel.app`)

**SAVE YOUR FRONTEND URL!**

---

### Step 4: Update Backend CORS (2 minutes) ✓

1. **Go back to Render Dashboard**
   - Find your `fashionai-backend` service
   - Click on it

2. **Update Environment Variable**
   - Go to "Environment" tab
   - Find `CLIENT_ORIGIN`
   - Update value to: `https://fashionai-studio.vercel.app`
   - Click "Save Changes"
   - Backend will automatically redeploy (~2 minutes)

---

### Step 5: Start Your Local AI Service ✓

1. **Keep AI Service Running**
   ```powershell
   # Terminal 1: AI Service
   cd project/ai_service
   python app.py
   ```

2. **Keep Ngrok Running**
   ```powershell
   # Terminal 2: Ngrok
   ngrok http 8000
   ```

**Important:** Keep both terminals running when people use your app!

---

## 🎉 You're Live!

### Access Your App
- **Frontend**: https://fashionai-studio.vercel.app
- **Backend**: https://fashionai-backend.onrender.com
- **AI Service**: Your PC (via ngrok)

### Test It
1. Open your Vercel URL
2. Sign up for an account
3. Try generating a design
4. It should work! 🎨

---

## 🔧 Troubleshooting

### Backend Returns 502/503
- **Issue**: Backend is sleeping (Render free tier)
- **Solution**: Wait 30 seconds for cold start, or keep it awake with UptimeRobot

### AI Features Don't Work
- **Check**: Is `python app.py` running?
- **Check**: Is `ngrok http 8000` running?
- **Check**: Is AI_SERVICE_URL correct in Render?

### CORS Errors
- **Check**: Is CLIENT_ORIGIN set to your Vercel URL in Render?
- **Check**: Did backend redeploy after updating?

### MongoDB Connection Failed
- **Check**: Is MongoDB Atlas allowing connections from anywhere (0.0.0.0/0)?
- **Check**: Is password correct in connection string?
- **Check**: Did you add database name to connection string?

---

## 🔄 When Ngrok URL Changes

**Every time you restart ngrok**, the URL changes. You need to:

1. **Get new URL**: Check ngrok terminal for new URL
2. **Update Render**:
   - Go to Render dashboard
   - Click your backend service
   - Go to "Environment" tab
   - Update `AI_SERVICE_URL` with new ngrok URL
   - Save (backend will redeploy)

**To avoid this:** Use Cloudflare Tunnel (permanent URL) or ngrok paid plan ($8/month for static domain).

---

## 💡 Keep Backend Awake (Optional)

Render free tier sleeps after 15 minutes. To keep it awake:

1. **Go to UptimeRobot**
   - Visit: https://uptimerobot.com
   - Sign up (free)

2. **Add Monitor**
   - Click "Add New Monitor"
   - Monitor Type: HTTP(s)
   - Friendly Name: FashionAI Backend
   - URL: https://fashionai-backend.onrender.com/health
   - Monitoring Interval: 5 minutes
   - Click "Create Monitor"

This pings your backend every 5 minutes, keeping it awake!

---

## 📊 Current Architecture

```
User visits: https://fashionai-studio.vercel.app (Vercel - FREE)
    ↓
Calls API: https://fashionai-backend.onrender.com (Render - FREE)
    ↓
Backend proxies AI requests to: https://interlinearly-intergular-adolfo.ngrok-free.dev
    ↓
Your PC processes with AI models (Stable Diffusion, CLIP, FAISS)
    ↓
Returns results back to user
```

**Database**: MongoDB Atlas (FREE)

---

## 💰 Total Cost

- Frontend (Vercel): **$0/month**
- Backend (Render): **$0/month** (750 hrs)
- Database (MongoDB Atlas): **$0/month** (512MB)
- Ngrok: **$0/month** (free tier)
- AI Service: **$0/month** (your PC)

**Total: $0/month** 🎉

---

## 🎓 Next Steps

### Make It Better:
1. **Get permanent URL**: Use Cloudflare Tunnel instead of ngrok
2. **Custom domain**: Add your own domain to Vercel (free)
3. **Keep backend awake**: Set up UptimeRobot monitoring
4. **Monitor usage**: Check Render/Vercel dashboards

### When Ready to Scale:
- Upgrade to paid Render plan ($7/month) for always-on backend
- Deploy AI service to cloud with GPU ($50+/month)
- Add caching layer (Redis)
- Set up CI/CD pipelines

---

**🎉 Congratulations! Your app is now live and accessible to anyone in the world!**

**Questions or issues?** Check the troubleshooting section or review the deployment steps.
