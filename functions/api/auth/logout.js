import { json, fail, sameOrigin, destroySession, sessionCookie } from "../../../lib/util.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, "잘못된 요청이에요.");
  await destroySession(env, request);
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(request, "", 0) });
}
