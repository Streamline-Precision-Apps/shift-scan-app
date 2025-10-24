import { jwtDecode } from "jwt-decode";

export interface JwtUserPayload {
  id: string;
}

export function getSession(token: string): JwtUserPayload | null {
  try {
    return jwtDecode<JwtUserPayload>(token);
  } catch {
    return null;
  }
}
