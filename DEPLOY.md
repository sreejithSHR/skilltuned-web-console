# Deploying the VR Command Center (Render / Railway)

This app is **not** Vercel-compatible: it runs a **custom Node server** (`server.js`)
with **Socket.IO** and an in-memory session registry. Vercel is serverless and can't
keep a WebSocket server alive. Deploy it to a host that runs a persistent Node
process — **Render**, **Railway**, or **Fly.io**. Render steps below; Railway is
nearly identical.

## 1. Push the repo to GitHub
Only the `nextjs web console/` folder is the web app. Either make it the repo root or
set the service's **Root Directory** to `nextjs web console`.

## 2. Create a Web Service on Render
- **Environment:** Node
- **Build command:**
  ```
  npm install && npx prisma generate && npx prisma migrate deploy && npm run build
  ```
- **Start command:**
  ```
  npm run start
  ```
  (= `cross-env NODE_ENV=production node server.js`)

`server.js` already reads `process.env.PORT` and `listen(port)` binds all interfaces,
so Render's port routing works with no changes.

## 3. Environment variables
| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Neon connection string (use the **pooled** URL) |
| `JWT_SECRET`   | a long random string (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `NODE_ENV`     | `production` |

## 4. Seed once
After the first deploy, run in the Render shell (or a one-off job):
```
npm run db:seed
```
Creates the demo org, admin login (`admin@demo.com` / `admin123`), the VR usernames,
and the scene rows.

## 5. Point Unreal at the live URL
Render gives you `https://your-app.onrender.com`. In the VR app:
- Login URL → `https://your-app.onrender.com/api/vr/login`
- SocketIO **Connect** address → `https://your-app.onrender.com`

HTTPS/WSS is provided automatically — important because Quest release builds usually
block cleartext `http://`. Once deployed, take an Oculus build and it connects over
the internet to this URL. ✅

## Notes
- Socket.IO server CORS is already `*`, so the cross-origin Unreal client connects fine.
- The in-memory live-session registry resets if the service restarts (headsets simply
  reconnect). Fine for a single instance; if you ever scale to multiple instances,
  move the registry to Redis.
