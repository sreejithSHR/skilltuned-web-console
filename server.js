require('dotenv').config();

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

// In-memory registry: orgId → Map<vrUserId, { username, connectedAt, socketId }>
const activeVRUsers = new Map();
// Expose to Next API routes (same process) for super-admin live monitoring
global._activeVRUsers = activeVRUsers;

function getOrgRegistry(orgId) {
  if (!activeVRUsers.has(orgId)) activeVRUsers.set(orgId, new Map());
  return activeVRUsers.get(orgId);
}

async function logAudit(orgId, type, message, actor) {
  if (!orgId) return;
  try {
    const entry = await prisma.auditLog.create({ data: { orgId, type, message, actor: actor || null } });
    if (global._io) global._io.to(`org:${orgId}`).emit('audit_log', entry);
  } catch (err) {
    console.error('audit log error:', err);
  }
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      await handle(req, res, parse(req.url, true));
    } catch (err) {
      console.error('Request error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  global._io = io;

  // ── JWT auth middleware ───────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.data.orgId = payload.orgId;

      if (payload.clientType === 'vr_user') {
        socket.data.clientType = 'vr_user';
        socket.data.vrUserId = payload.vrUserId;
        socket.data.username = payload.username;
      } else {
        socket.data.clientType = socket.handshake.auth?.clientType || 'console';
        socket.data.userId = payload.userId;
        socket.data.role = payload.role;
      }
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { orgId, clientType } = socket.data;
    const room = `org:${orgId}`;
    socket.join(room);

    // VR user joined
    if (clientType === 'vr_user') {
      const { vrUserId, username } = socket.data;
      const connectedAt = new Date().toISOString();
      getOrgRegistry(orgId).set(vrUserId, { username, connectedAt, socketId: socket.id });
      socket.to(room).emit('vr_user_joined', { vrUserId, username, connectedAt });
      logAudit(orgId, 'session_start', `${username} entered VR`, username);
    }

    // New console client: send snapshot of currently active VR users
    if (clientType === 'console') {
      const registry = getOrgRegistry(orgId);
      if (registry.size > 0) {
        const snapshot = Array.from(registry.entries()).map(([vrUserId, data]) => ({
          vrUserId,
          username: data.username,
          connectedAt: data.connectedAt,
        }));
        socket.emit('vr_users_snapshot', snapshot);
      }
    }

    // Admin broadcasts scene
    socket.on('broadcast_scene', async ({ sceneKey }) => {
      if (socket.data.role !== 'admin') return;
      socket.to(room).emit('load_scene', { sceneKey });
      logAudit(orgId, 'scene_play', `Played scene "${sceneKey}" to all headsets`, socket.data.userId);
    });

    // Admin stops all
    socket.on('stop_all', () => {
      if (socket.data.role !== 'admin') return;
      socket.to(room).emit('load_scene', { sceneKey: 'L_Lobby' });
      socket.to(room).emit('stop_all');
    });

    // Headset heartbeat
    socket.on('headset_status', async ({ deviceId, currentScene, batteryLevel, status }) => {
      socket.data.clientType = 'headset';
      socket.data.deviceId = deviceId;

      try {
        await prisma.headset.updateMany({
          where: { deviceId, orgId },
          data: { currentScene, batteryLevel, status, lastSeen: new Date() },
        });
      } catch (err) {
        console.error('headset_status DB error:', err);
      }

      socket.to(room).emit('headset_status', { deviceId, currentScene, batteryLevel, status });
    });

    // Headset register
    socket.on('register', async ({ deviceId }) => {
      socket.data.clientType = 'headset';
      socket.data.deviceId = deviceId;
      try {
        await prisma.headset.updateMany({
          where: { deviceId, orgId },
          data: { status: 'online', lastSeen: new Date() },
        });
      } catch (err) {
        console.error('register DB error:', err);
      }
      socket.to(room).emit('headset_online', { deviceId });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      if (clientType === 'vr_user') {
        const { vrUserId, username } = socket.data;
        getOrgRegistry(orgId).delete(vrUserId);
        io.to(room).emit('vr_user_left', { vrUserId, username });
        logAudit(orgId, 'session_end', `${username} left VR`, username);
        return;
      }

      if (clientType === 'headset' && socket.data.deviceId) {
        try {
          await prisma.headset.updateMany({
            where: { deviceId: socket.data.deviceId, orgId },
            data: { status: 'offline' },
          });
        } catch (err) {
          console.error('disconnect DB error:', err);
        }
        io.to(room).emit('headset_status', { deviceId: socket.data.deviceId, status: 'offline' });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> VR Command Center ready on http://${hostname}:${port}`);
  });
});
