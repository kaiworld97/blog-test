// Pages Functions 공용 헬퍼 (functions/ 밖에 둬서 라우트로 노출되지 않게 함)

export const CATEGORIES = ["재테크 기초", "저축", "투자", "세금·연말정산", "소비·절약", "기타"];
export const SESSION_DAYS = 14;

const enc = new TextEncoder();

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}
export const fail = (status, message) => json({ error: message }, status);

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export function randomHex(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}
export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}
export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: 100000 }, // Workers 최대치
    key,
    256
  );
  return toHex(bits);
}
export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function getCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export function sessionCookie(request, token, maxAgeSec) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export async function createSession(env, request, userId) {
  const token = randomHex(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256Hex(token), userId, expires)
    .run();
  // 가끔 만료된 세션 정리
  if (Math.random() < 0.05) {
    await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(new Date().toISOString()).run();
  }
  return sessionCookie(request, token, SESSION_DAYS * 86400);
}

export async function getUser(env, request) {
  const token = getCookie(request, "sid");
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return await env.DB.prepare(
    "SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
  )
    .bind(await sha256Hex(token), new Date().toISOString())
    .first();
}

export async function destroySession(env, request) {
  const token = getCookie(request, "sid");
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
}

// CSRF 방어: 쓰기 요청은 같은 출처에서 온 것만 허용
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}

export async function readJson(request) {
  try {
    const data = await request.json();
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export function validatePost(b) {
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const body = typeof b.body === "string" ? b.body.trim() : "";
  if (!title || title.length > 100) return { error: "제목은 1~100자로 입력해 주세요." };
  if (!body || body.length > 20000) return { error: "본문은 1~20,000자로 입력해 주세요." };
  if (!CATEGORIES.includes(b.category)) return { error: "카테고리를 선택해 주세요." };
  if (!["public", "private"].includes(b.visibility)) return { error: "공개 범위를 선택해 주세요." };
  return { value: { title, body, category: b.category, visibility: b.visibility } };
}

export function excerpt(body) {
  return body
    .replace(/^##\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^-\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
