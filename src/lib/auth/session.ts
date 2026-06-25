import { SignJWT, jwtVerify } from "jose";

// Signed session token (JWT HS256). No Supabase Auth — we mint our own.
export const SESSION_COOKIE = "dl_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (seconds)

export interface SessionUser {
  id: string;
  username: string;
}

function secret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

/** Verify a session token; returns the user or null. Safe in edge + node. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.username !== "string") return null;
    return { id: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
