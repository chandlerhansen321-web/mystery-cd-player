# 🔧 Vercel Deployment Fix

I've restructured the backend to work with Vercel's serverless functions!

## What Changed

- Created `api/` directory with serverless functions
- `api/cd/[code].js` - Get CD by code (GET request)
- `api/cd/index.js` - Create new CD (POST request)
- `api/_storage.js` - Shared storage (global object persists within instance)
- Updated `vercel.json` for proper routing

## How to Deploy the Fix

### If using Git/GitHub:

```bash
cd /Users/chandlerhansen/Downloads/mystery-cd-app

# Add all files
git add .

# Commit the changes
git commit -m "Fix Vercel serverless functions"

# Push to GitHub
git push
```

Vercel will automatically redeploy! Wait 1-2 minutes and your app should work.

### If uploading manually:

1. Go to your GitHub repo
2. Delete the old `server.js` file (not needed for Vercel)
3. Upload the new `api/` folder with all its files:
   - `api/_storage.js`
   - `api/cd/index.js`
   - `api/cd/[code].js`
4. Upload the updated `vercel.json`

Vercel will auto-deploy the changes.

## Testing After Deploy

1. Wait for deployment to finish (check Vercel dashboard)
2. Visit your URL: `https://your-app.vercel.app`
3. Try creating a CD
4. Try loading the CD with the code

## Important Notes

**Storage Limitation:**
- CDs are stored in global memory within the serverless instance
- They will persist during the instance's lifetime
- **CDs will reset when:**
  - You redeploy the app
  - Vercel scales down/up instances
  - After periods of inactivity

**For Permanent Storage (Optional):**
If you want CDs to never disappear, you'll need a database:
- Vercel KV (easiest - Redis)
- MongoDB Atlas
- Supabase

All have free tiers! Let me know if you want help setting this up.

## Troubleshooting

**Still getting 404?**
- Check Vercel deployment logs
- Make sure the `api/` folder is uploaded to GitHub
- Verify `vercel.json` is in the root directory

**CDs not saving?**
- Check browser console for CORS errors
- Verify the API endpoint URLs are correct
- Check Vercel function logs

---

**Your app should work now! Try it out and let me know if you need help with permanent storage.** 🚀
