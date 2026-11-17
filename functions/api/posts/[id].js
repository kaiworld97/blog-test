import { json, fail, getUser, sameOrigin, readJson, validatePost } from "../../../lib/util.js";

const parseId = (params) => (/^\d{1,12}$/.test(params.id) ? Number(params.id) : null);

async function load(env, id) {
  return env.DB.prepare(
    `SELECT p.id, p.user_id, p.title, p.body, p.category, p.visibility, p.created_at, p.updated_at, u.username AS author
     FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
  )
    .bind(id)
    .first();
}

export async function onRequestGet({ request, env, params }) {
  const id = parseId(params);
  if (!id) return fail(404, "글을 찾을 수 없어요.");
  const user = await getUser(env, request);
  const p = await load(env, id);
  const mine = !!(p && user && user.id === p.user_id);
  // 나만보기 글은 작성자 외에는 존재 자체를 숨김(404)
  if (!p || (p.visibility === "private" && !mine)) return fail(404, "글을 찾을 수 없어요.");
  const { user_id, ...post } = p;
  return json({ post: { ...post, mine } });
}

export async function onRequestPut({ request, env, params }) {
  if (!sameOrigin(request)) return fail(403, "잘못된 요청이에요.");
  const id = parseId(params);
  const user = await getUser(env, request);
  if (!user) return fail(401, "로그인이 필요해요.");
  const p = id && (await load(env, id));
  if (!p || p.user_id !== user.id) return fail(404, "글을 찾을 수 없어요.");

  const b = await readJson(request);
  if (!b) return fail(400, "잘못된 요청이에요.");
  const v = validatePost(b);
  if (v.error) return fail(400, v.error);

  await env.DB.prepare(
    "UPDATE posts SET title = ?, body = ?, category = ?, visibility = ?, updated_at = ? WHERE id = ? AND user_id = ?"
  )
    .bind(v.value.title, v.value.body, v.value.category, v.value.visibility, new Date().toISOString(), id, user.id)
    .run();
  return json({ id });
}

export async function onRequestDelete({ request, env, params }) {
  if (!sameOrigin(request)) return fail(403, "잘못된 요청이에요.");
  const id = parseId(params);
  const user = await getUser(env, request);
  if (!user) return fail(401, "로그인이 필요해요.");
  const p = id && (await load(env, id));
  if (!p || p.user_id !== user.id) return fail(404, "글을 찾을 수 없어요.");
  await env.DB.prepare("DELETE FROM posts WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  return json({ ok: true });
}
