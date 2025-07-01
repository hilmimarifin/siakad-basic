import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const secretKey = process.env.JWT_SECRET || "your-secret-key";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input?: string): Promise<any | null> {
  if (!input || typeof input !== 'string') {
    // Bisa return null, throw error, atau handle sesuai kebutuhan
    console.warn('Token is missing or invalid');
    return null;
  }

  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
export async function getSession() {
  const session = cookies().get("session")?.value;
  
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return await encrypt(parsed);
}
