// GET /sitemap.xml → 홈 + 공개 글 전체 (나만보기 글은 제외)
import { SITE_URL, esc, toIso } from "../lib/site.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, created_at, updated_at FROM posts WHERE visibility = 'public' ORDER BY id DESC LIMIT 1000"
  ).all();
  const urls = [`<url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`];
  for (const p of results) {
    const last = toIso(p.updated_at || p.created_at);
    urls.push(
      `<url><loc>${esc(`${SITE_URL}/post?id=${p.id}`)}</loc>${last ? `<lastmod>${last.slice(0, 10)}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.7</priority></url>`
    );
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
