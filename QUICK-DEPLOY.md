# 🚀 Quick Deploy Guide

## 1️⃣ **Setup (Run Once)**
```bash
node deploy-setup.js
```

## 2️⃣ **Database (Free - Neon)**
1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create project "introvirght"
3. Copy DATABASE_URL

## 3️⃣ **Backend (Free - Railway)**
1. Go to [railway.app](https://railway.app) → Sign up
2. New Project → Deploy from GitHub
3. Select your repo, set root to `server`
4. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your-neon-url-here
   JWT_SECRET=generate-random-string
   FRONTEND_URL=https://your-app.vercel.app
   ```

## 4️⃣ **Frontend (Free - Vercel)**
1. Go to [vercel.com](https://vercel.com) → Sign up
2. New Project → Import your repo
3. Set root directory to `introvirght`
4. Framework: Vite
5. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

## 5️⃣ **Update URLs**
- Copy your Vercel URL
- Update `FRONTEND_URL` in Railway to match

## 6️⃣ **Test**
- Visit your Vercel URL
- Try signing up and logging in
- Create a post

## 🎉 **Done!**
Your app is now live and accessible worldwide!

**Free Tier Limits:**
- Vercel: 100GB bandwidth/month
- Railway: $5 credit/month
- Neon: 512MB database storage

**Total Cost: $0/month** (within free limits)