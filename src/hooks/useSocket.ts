"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { HeadsetStatus, VRUserStatus } from "@/types";

interface UseSocketReturn {
  isConnected: boolean;
  headsetStatuses: Map<string, HeadsetStatus>;
  vrUserStatuses: Map<string, VRUserStatus>;
  broadcastScene: (sceneKey: string) => void;
  stopAll: () => void;
  lastEvent: string | null;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [headsetStatuses, setHeadsetStatuses] = useState<Map<string, HeadsetStatus>>(new Map());
  const [vrUserStatuses, setVrUserStatuses] = useState<Map<string, VRUserStatus>>(new Map());
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (!token) return;

    const socket = io({
      auth: { token, clientType: "console" },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setLastEvent("Connected to Command Center");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setLastEvent("Connection lost — reconnecting...");
    });

    // ── Headset events ────────────────────────────────────────────────────
    socket.on("headset_status", (status: HeadsetStatus) => {
      setHeadsetStatuses((prev) => {
        const next = new Map(prev);
        next.set(status.deviceId, status);
        return next;
      });
      setLastEvent(`Headset ${status.deviceId} — ${status.status}`);
    });

    socket.on("headset_online", ({ deviceId }: { deviceId: string }) => {
      setLastEvent(`Headset ${deviceId} came online`);
    });

    // ── VR user events ────────────────────────────────────────────────────

    // Full snapshot sent once on console connect (catches users already in-session)
    socket.on("vr_users_snapshot", (users: VRUserStatus[]) => {
      setVrUserStatuses(new Map(users.map((u) => [u.vrUserId, u])));
    });

    socket.on("vr_user_joined", (user: VRUserStatus) => {
      setVrUserStatuses((prev) => {
        const next = new Map(prev);
        next.set(user.vrUserId, user);
        return next;
      });
      setLastEvent(`${user.username} entered VR`);
    });

    socket.on("vr_user_left", ({ vrUserId, username }: { vrUserId: string; username: string }) => {
      setVrUserStatuses((prev) => {
        const next = new Map(prev);
        next.delete(vrUserId);
        return next;
      });
      setLastEvent(`${username} left VR`);
    });

    socket.on("connect_error", () => {
      setLastEvent("Connection error — retrying...");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const broadcastScene = useCallback((sceneKey: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("broadcast_scene", { sceneKey });
      setLastEvent(`Broadcasting scene: ${sceneKey}`);
    }
  }, []);

  const stopAll = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("stop_all");
      setLastEvent("Stop all command sent");
    }
  }, []);

  return { isConnected, headsetStatuses, vrUserStatuses, broadcastScene, stopAll, lastEvent };
}
