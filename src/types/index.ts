// ===== Organization =====
export interface Org {
  id: string;
  name: string;
}

export type Role = "superadmin" | "admin" | "viewer";

// ===== User =====
export interface User {
  id: string;
  orgId: string;
  email: string;
  role: Role;
}

// ===== Institution (Org) with monitoring stats =====
export interface Institution {
  id: string;
  name: string;
  createdAt: string;
  liveCount: number;
  counts: {
    users: number;
    vrUsers: number;
    scenes: number;
    headsets: number;
  };
}

// ===== Headset =====
export interface Headset {
  id: string;
  orgId: string;
  deviceToken: string;
  deviceId: string;
  label: string;
  lastSeen: string;
  currentScene: string;
  batteryLevel: number;
  status: "online" | "offline" | "standby";
}

// ===== Scene =====
export interface Scene {
  id: string;
  orgId: string;
  name: string;
  sceneKey: string;
  description: string;
  tags: string[];
  thumbnailUrl: string | null;
}

// ===== Broadcast Log =====
export interface BroadcastLog {
  id: string;
  orgId: string;
  sceneKey: string;
  initiatedBy: string;
  headsetsTargeted: number;
  timestamp: string;
}

// ===== Audit Log =====
export interface AuditLog {
  id: string;
  orgId: string;
  type: string;
  message: string;
  actor: string | null;
  createdAt: string;
}

// ===== Headset Status (real-time) =====
export interface HeadsetStatus {
  deviceId: string;
  currentScene: string;
  batteryLevel: number;
  status: "online" | "offline" | "standby";
}

// ===== API Response =====
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ===== Auth =====
export interface AuthState {
  user: User | null;
  token: string | null;
  org: Org | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ===== VR User =====
export interface VRUser {
  id: string;
  orgId: string;
  username: string;
  createdAt: string;
}

// ===== VR User live status (socket) =====
export interface VRUserStatus {
  vrUserId: string;
  username: string;
  connectedAt: string; // ISO string — used to compute session duration
}

// ===== Stats =====
export interface DashboardStats {
  totalHeadsets: number;
  onlineHeadsets: number;
  activeScene: string;
  totalBroadcastsToday: number;
}
