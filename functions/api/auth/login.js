import { json, fail, sameOrigin, readJson, hashPassword, safeEqual, createSession } from "../../../lib/util.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, "잘못된 요청이에요.");
  const b = await readJson(request);
  if (!b) return fail(400, "잘못된 요청이에요.");

  const username = typeof b.username === "string" ? b.username.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const row = await env.DB.prepare("SELECT id, username, password_hash, salt FROM users WHERE username = ?")
    .bind(username)
    .first();

  // 없는 아이디여도 해시를 계산해 응답 시간 차이를 줄임
  const hash = await hashPassword(password, row ? row.salt : "no-such-user");
  if (!row || !safeEqual(hash, row.password_hash)) return fail(401, "아이디 또는 비밀번호가 맞지 않아요.");

  const cookie = await createSession(env, request, row.id);
  return json({ user: { id: row.id, username: row.username } }, 200, { "set-cookie": cookie });
}
