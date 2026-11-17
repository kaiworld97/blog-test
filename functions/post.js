// GET /post?id=N  → 정적 post.html 에 글별 SEO 태그(title, description, OG, canonical, JSON-LD)를 끼워 넣어 응답
// 글 내용 화면은 기존처럼 app.js 가 그립니다. 검색엔진·SNS 미리보기용 태그만 서버에서 채웁니다.
import { excerpt } from "../lib/util.js";
import { SITE_URL, SITE_NAME, OG_IMAGE, esc, toIso } from "../lib/site.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const idParam = url.searchParams.get("id") || "";
  const id = /^\d{1,12}$/.test(idParam) ? Number(idParam) : null;

  const asset = await env.ASSETS.fetch(new Request(new URL("/post.html", url), { headers: request.headers, redirect: "follow" }));
  const base = new Response(asset.body, asset);

  const post = id
    ? await env.DB.prepare(
        `SELECT p.id, p.title, p.body, p.category, p.visibility, p.created_at, p.updated_at, u.username AS author
         FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ? AND p.visibility = 'public'`
      ).bind(id).first()
    : null;

  // 없는 글·나만보기 글: 검색에 잡히지 않게 하고 존재 여부도 드러내지 않음 (화면은 app.js 가 처리)
  if (!post) {
    return new HTMLRewriter()
      .on("head", { element(el) { el.append('<meta name="robots" content="noindex">', { html: true }); } })
      .transform(base);
  }

  const canonical = `${SITE_URL}/post?id=${post.id}`;
  const title = `${post.title} — ${SITE_NAME}`;
  const desc = excerpt(post.body);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: desc,
    articleSection: post.category,
    datePublished: toIso(post.created_at),
    dateModified: toIso(post.updated_at),
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-touch-icon.png` } },
    image: OG_IMAGE,
    mainEntityOfPage: canonical,
    inLanguage: "ko-KR",
  };
  const tags = [
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="ko_KR">`,
    `<meta property="og:title" content="${esc(post.title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${SITE_NAME} — 사회초년생을 위한 돈 이야기">`,
    `<meta property="article:published_time" content="${toIso(post.created_at) || ""}">`,
    `<meta property="article:section" content="${esc(post.category)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(post.title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
  ].join("\n  ");

  return new HTMLRewriter()
    .on("title", { element(el) { el.setInnerContent(title); } })
    .on("head", { element(el) { el.append("\n  " + tags + "\n", { html: true }); } })
    .transform(base);
}
