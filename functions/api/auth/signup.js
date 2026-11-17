import { json, fail, sameOrigin, readJson, hashPassword, randomHex, createSession } from "../../../lib/util.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, "잘못된 요청이에요.");
  const b = await readJson(request);
  if (!b) return fail(400, "잘못된 요청이에요.");

  const username = typeof b.username === "string" ? b.username.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return fail(400, "아이디는 영문 소문자·숫자·밑줄(_) 3~20자로 입력해 주세요.");
  if (password.length < 8 || password.length > 100) return fail(400, "비밀번호는 8자 이상으로 입력해 주세요.");

  const salt = randomHex(16);
  const hash = await hashPassword(password, salt);
  let userId;
  try {
    const r = await env.DB.prepare("INSERT INTO users (username, password_hash, salt, created_at) VALUES (?, ?, ?, ?)")
      .bind(username, hash, salt, new Date().toISOString())
      .run();
    userId = r.meta.last_row_id;
  } catch {
    return fail(409, "이미 사용 중인 아이디예요.");
  }
  const cookie = await createSession(env, request, userId);
  return json({ user: { id: userId, username } }, 201, { "set-cookie": cookie });
}
