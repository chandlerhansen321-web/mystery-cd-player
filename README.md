# 📀 Mystery CD Player

A retro 90s-style web app for creating and sharing mystery music playlists!

## 🎵 What is this?

Mystery CD Player lets you create music playlists (like making a mixtape) where the recipient doesn't know what songs are on it until they play them. It's like the old days of receiving a CD from a friend with no track listing!

## ✨ Features

- 🎨 **Retro 90s design** with authentic CD player aesthetics
- 💿 **Animated CDs** that eject when created and insert when loaded
- 🎭 **Mystery reveal** - track names hidden until you play them
- 🔗 **Easy sharing** via 6-character codes
- 🎵 **YouTube integration** for massive music library
- 💌 **Personal messages** to accompany your mixes

## 🚀 How to Use

### Creating a CD

1. Click "💿 CREATE CD"
2. Enter a title for your mix
3. (Optional) Add a personal message
4. Search for songs and click ADD
5. Click "💿 CREATE CD"
6. Watch your CD pop out! 📀
7. Share the code with friends

### Playing a CD

1. Click "▶️ PLAY CD"
2. Enter the code you received
3. Watch the CD drop into the player!
4. Press PLAY to reveal tracks one by one
5. Enjoy the mystery! 🎧

## 🌐 Deployment

### Deploy to Vercel (Recommended - Free!)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. From this directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (choose your account)
   - Link to existing project? **N**
   - Project name? **mystery-cd-player** (or whatever you want)
   - In which directory is your code? **./** (current directory)
   - Want to override settings? **N**

4. Done! You'll get a URL like: `https://mystery-cd-player.vercel.app`

### Alternative: Deploy to Netlify

1. Drag and drop the `mystery-cd-app` folder into [Netlify Drop](https://app.netlify.com/drop)
2. Done! Instant deployment.

### Alternative: GitHub Pages

1. Create a new GitHub repository
2. Push this folder's contents
3. Go to Settings → Pages
4. Select main branch as source
5. Your site will be at: `https://yourusername.github.io/repo-name`

## 🔧 Local Development

### With Backend (Recommended)

```bash
cd mystery-cd-app

# Install dependencies
npm install

# Start the server
npm start
```

Then open: `http://localhost:3000`

### Frontend Only (Testing)

```bash
cd mystery-cd-app
python3 -m http.server 8000
```

Then open: `http://localhost:8000`
(Note: CD sharing won't work without the backend)

## 💡 How It Works

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks!)
- **Backend**: Node.js + Express API
- **Storage**: In-memory database (easily upgradeable to permanent DB)
- **Music**: YouTube IFrame API for playback
- **Sharing**: 6-character codes that work across all devices

## 🎨 Animations

- **CD Creation**: UI shifts down, CD appears above player with title, sparkles, then fades out
- **CD Loading**: UI shifts down, CD appears above player with title, then fades out
- **Playing**: CD appears and spins while music plays, stops when paused
- **All interactions**: Smooth transitions and hover effects

## 🚨 Important Notes

- **Backend included!** CDs are now shared across all devices
- In-memory storage (CDs may be lost on server restart - upgrade to permanent DB for production)
- YouTube API key is included for easy deployment
- Some videos may not be embeddable (auto-skips to next)
- **See DEPLOYMENT.md for hosting instructions**

## 🔮 Future Ideas

- Backend database for cross-device sharing
- User accounts and CD collections
- Collaborative playlists
- CD artwork customization
- Social features (trending CDs, friends' mixes)
- Export to Spotify/Apple Music playlists

## 📄 License

Feel free to use, modify, and share!

---

Made with 💿 and 90s nostalgia
