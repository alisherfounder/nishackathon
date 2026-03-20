import { Platform } from "react-native";

/**
 * Backend API base URL.
 *
 * - iOS Simulator  → localhost works directly
 * - Android Emulator → 10.0.2.2 maps to the host machine's localhost
 * - Physical device  → replace with your machine's LAN IP, e.g. "http://192.168.1.x:8000"
 */
export const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://localhost:8000";

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}
