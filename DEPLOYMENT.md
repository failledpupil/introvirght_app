# 🚀 Introvirght Deployment Guide

This guide will help you deploy your Introvirght app for **FREE** using the best available platforms.

## 📋 **Deployment Stack**

- **Frontend**: Vercel (Free tier - 100GB bandwidth/month)
- **Backend**: Railway or Render (Free tier with limitations)
- **Database**: Neon PostgreSQL (Free tier - 512MB storage)

---

## 🎯 **Step 1: Database Setup (Neon PostgreSQL)**

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub/Google
3. Create a new project named "introvirght"

### 1.2 Get Database URL
1. In your Neon dashboard, go to "Connection Details"
2. Copy the **Connection String** (DATABASE_URL)
3. It looks like: `postgresql://username:password@host/database`

---

## 🎯 **Step 2: Backend Deployment (Railway)**

### 2.1 Prepare Repository
```bash
# Make sure your code is in a Git repository
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder as the root directory

### 2.3 Configure Environment Variables
In Railway dashboard, go to Variables and add:

```env
NODE_ENV=production
DATABASE_URL=your-neon-database-url-here
JWT_SECRET=your-super-secure-random-string-here
FRONTEND_URL=https://your-app-name.vercel.app
PORT=3001
```

### 2.4 Generate JWT Secret
```bash
# Run this command to generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎯 **Step 3: Frontend Deployment (Vercel)**

### 3.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set **Root Directory** to `introvirght`
6. Framework Preset: **Vite**

### 3.2 Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
```

### 3.3 Update Domain Settings
1. Note your Vercel deployment URL (e.g., `https://introvirght.vercel.app`)
2. Go back to Railway and update `FRONTEND_URL` to match this URL

---

## 🎯 **Alternative: Render Deployment**

If Railway doesn't work, use Render:

### Backend on Render
1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect your GitHub repository
4. Root Directory: `server`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`

Environment Variables:
```env
NODE_ENV=production
DATABASE_URL=your-neon-database-url
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-vercel-url.vercel.app
```

---

## 🎯 **Step 4: Testing Deployment**

### 4.1 Test Backend
Visit: `https://your-backend-url.railway.app/health`
Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Try signing up with a new account
3. Test login functionality
4. Create a post to verify full functionality

---

## 🎯 **Step 5: Custom Domain (Optional)**

### 5.1 Frontend Domain
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 5.2 Backend Domain
1. In Railway dashboard, go to Settings → Domains
2. Add custom domain or use Railway's provided domain

---

## 🔧 **Troubleshooting**

### Common Issues:

**1. CORS Errors**
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that both HTTP and HTTPS are handled

**2. Database Connection Issues**
- Verify DATABASE_URL is correct
- Ensure Neon database is active (free tier sleeps after inactivity)

**3. Build Failures**
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility

**4. Environment Variables**
- Double-check all environment variables are set correctly
- Restart deployments after changing environment variables

### Logs and Debugging:
- **Railway**: Check "Deployments" tab for build logs
- **Vercel**: Check "Functions" tab for runtime logs
- **Neon**: Check "Monitoring" for database connection issues

---

## 💰 **Free Tier Limitations**

### Vercel (Frontend)
- ✅ 100GB bandwidth/month
- ✅ Unlimited static sites
- ✅ Custom domains
- ❌ No server-side functions limits

### Railway (Backend)
- ✅ $5 credit/month (usually enough for small apps)
- ✅ 512MB RAM
- ✅ Custom domains
- ❌ Sleeps after 30 minutes of inactivity

### Neon (Database)
- ✅ 512MB storage
- ✅ 1 database
- ✅ Branching (like Git for databases)
- ❌ Sleeps after 5 minutes of inactivity

---

## 🚀 **Going Live Checklist**

- [ ] Database created and accessible
- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] Environment variables configured
- [ ] CORS configured properly
- [ ] Authentication works (signup/login)
- [ ] Core features functional (posts, diary)
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Performance testing completed

---

## 📞 **Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in Railway/Vercel dashboards
3. Verify all environment variables are set correctly
4. Test API endpoints directly using tools like Postman

Your Introvirght app should now be live and accessible to users worldwide! 🌍✨