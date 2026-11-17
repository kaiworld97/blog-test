import { json, fail, getUser, sameOrigin, readJson, validatePost, excerpt, CATEGORIES } from "../../../lib/util.js";

// GET /api/posts            → 공개 글 목록 (?category= 로 필터)
// GET /api/posts?mine=1     → 내 글 전체 (공개 + 나만보기), 로그인 필요
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const user = await getUser(env, request);
  let rows;

  if (url.searchParams.get("mine") === "1") {
    if (!user) return fail(401, "로그인이 필요해요.");
    rows = await env.DB.prepare(
      `SELECT p.id, p.title, p.body, p.category, p.visibility, p.created_at, p.updated_at, u.username AS author, p.user_id
       FROM posts p JOIN users u ON u.id = p.user_id WHERE p.user_id = ? ORDER BY p.id DESC LIMIT 100`
    )
      .bind(user.id)
      .all();
  } else {
    const category = url.searchParams.get("category");
    const filter = category && CATEGORIES.includes(category);
    rows = await env.DB.prepare(
      `SELECT p.id, p.title, p.body, p.category, p.visibility, p.created_at, p.updated_at, u.username AS author, p.user_id
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.visibility = 'public' ${filter ? "AND p.category = ?" : ""} ORDER BY p.id DESC LIMIT 50`
    )
      .bind(...(filter ? [category] : []))
      .all();
  }

  const posts = rows.results.map((r) => ({
    id: r.id,
    title: r.title,
    excerpt: excerpt(r.body),
    category: r.category,
    visibility: r.visibility,
    author: r.author,
    created_at: r.created_at,
    updated_at: r.updated_at,
    mine: !!user && user.id === r.user_id,
  }));
  return json({ posts });
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, "잘못된 요청이에요.");
  const user = await getUser(env, request);
  if (!user) return fail(401, "로그인이 필요해요.");
  const b = await readJson(request);
  if (!b) return fail(400, "잘못된 요청이에요.");
  const v = validatePost(b);
  if (v.error) return fail(400, v.error);

  const now = new Date().toISOString();
  const r = await env.DB.prepare(
    "INSERT INTO posts (user_id, title, body, category, visibility, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(user.id, v.value.title, v.value.body, v.value.category, v.value.visibility, now, now)
    .run();
  return json({ id: r.meta.last_row_id }, 201);
}
