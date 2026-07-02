# 🚀 Mystery CD Player - Deployment Guide

This guide will help you deploy your Mystery CD Player with a backend so your friends can share CDs across devices!

## 📋 What You'll Need

- A [GitHub](https://github.com) account (free)
- A [Vercel](https://vercel.com) account (free - sign up with GitHub)
- 10-15 minutes

## 🎯 Quick Deploy to Vercel (Recommended - FREE!)

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** button in the top right → **New repository**
3. Name it: `mystery-cd-player`
4. Make it **Public** (required for free hosting)
5. Click **Create repository**

### Step 2: Upload Your Files to GitHub

**Option A: Using GitHub Web Interface (Easiest)**

1. On your new repo page, click **uploading an existing file**
2. Drag and drop ALL files from your `mystery-cd-player` folder:
   - `index.html`
   - `app.js`
   - `api/` (the whole folder)
   - `package.json`
   - `vercel.json`
   - `README.md`
   - `DEPLOYMENT.md` (this file)
3. Scroll down and click **Commit changes**

**Option B: Using Git Command Line**

```bash
cd /Users/chandlerhansen/Downloads/mystery-cd-app

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Mystery CD Player"

# Add your GitHub repo as remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/mystery-cd-player.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → Sign in with GitHub
3. Click **Add New...** → **Project**
4. Find and click **Import** next to your `mystery-cd-player` repo
5. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./` (leave as default)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
6. Click **Deploy**
7. Wait 1-2 minutes ⏳
8. 🎉 **Done!** You'll get a URL like: `https://mystery-cd-player.vercel.app`

### Step 4: Share Your App!

Your app is now live! Share the URL with your friends:
- They can create CDs and get shareable codes
- Codes work across all devices and users
- No sign-up required for users!

## 🔧 Important Notes

### About the Backend

The backend is a pair of Vercel serverless functions (`api/cd/`) that store CDs
in **Vercel Blob**:
- ✅ Free tier is plenty for personal use
- ✅ CDs persist across deploys and restarts
- ⚠️ Requires a Blob store connected to the Vercel project (Storage → Create → Blob),
  which provides the `BLOB_READ_WRITE_TOKEN` env var the functions need

## 🐛 Troubleshooting

### "Module not found" error
- Make sure `package.json` is uploaded to GitHub

### API not working
- Check that `vercel.json` is properly configured
- Make sure the `api/` folder is in the root directory

### CDs not saving
- Check browser console for errors (F12)
- Verify the deployment succeeded on Vercel dashboard

### YouTube videos not playing
- This is normal for some videos (copyright restrictions)
- The app will auto-skip to the next track

## 🔄 Updating Your App

After making changes:

```bash
cd /Users/chandlerhansen/Downloads/mystery-cd-app

# Make your changes to files, then:
git add .
git commit -m "Describe your changes"
git push
```

Vercel will automatically redeploy! ⚡

## 💰 Costs

Everything is **100% FREE** with these limitations:
- Vercel Free: 100GB bandwidth/month (plenty for personal use)
- GitHub: Unlimited public repos
- No credit card required!

## 🎨 Custom Domain (Optional)

Want a custom URL like `mycd.com` instead of `mystery-cd-player.vercel.app`?

1. Buy a domain from [Namecheap](https://namecheap.com) or [Google Domains](https://domains.google)
2. Go to Vercel → Your Project → Settings → Domains
3. Add your custom domain and follow the DNS instructions

---

## 🆘 Need Help?

If you run into issues:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Check your Vercel deployment logs
3. Make sure all files are in GitHub

Enjoy sharing your Mystery CDs! 📀✨
