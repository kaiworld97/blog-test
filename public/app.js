(() => {
  "use strict";
  const CATEGORIES = ["재테크 기초", "저축", "투자", "세금·연말정산", "소비·절약", "기타"];
  const $ = (s, r = document) => r.querySelector(s);

  // 사용자 입력은 항상 textContent로만 넣는다 (innerHTML 사용 금지)
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    el.append(...kids.flat().filter((x) => x != null && x !== false));
    return el;
  }

  async function api(path, { method = "GET", body } = {}) {
    const res = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      headers: body ? { "content-type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) throw Object.assign(new Error((data && data.error) || "요청에 실패했어요. 잠시 후 다시 시도해 주세요."), { status: res.status });
    return data;
  }

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };
  const safeNext = (n) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/");

  // 아주 작은 마크다운: ## 제목, - 목록, **굵게**, 빈 줄 = 문단
  function inline(text) {
    const frag = document.createDocumentFragment();
    text.split(/(\*\*[^*]+\*\*)/).forEach((p) => {
      if (/^\*\*[^*]+\*\*$/.test(p)) frag.append(h("strong", { text: p.slice(2, -2) }));
      else if (p) frag.append(p);
    });
    return frag;
  }
  function renderBody(text) {
    const root = h("div", { class: "prose" });
    let para = [], ul = null;
    const flushPara = () => {
      if (!para.length) return;
      const p = h("p");
      para.forEach((line, i) => { if (i) p.append(h("br")); p.append(inline(line)); });
      root.append(p); para = [];
    };
    for (const raw of text.replace(/\r/g, "").split("\n")) {
      const line = raw.trimEnd();
      if (/^##\s+/.test(line)) { flushPara(); ul = null; root.append(h("h2", { text: line.replace(/^##\s+/, "") })); }
      else if (/^-\s+/.test(line)) { flushPara(); if (!ul) { ul = h("ul"); root.append(ul); } ul.append(h("li", null, inline(line.replace(/^-\s+/, "")))); }
      else if (!line.trim()) { flushPara(); ul = null; }
      else { ul = null; para.push(line); }
    }
    flushPara();
    return root;
  }

  let me = null;

  function renderNav() {
    const nav = $("#nav");
    nav.replaceChildren();
    if (me) {
      nav.append(
        h("a", { href: "/write", class: "btn sm primary", text: "글쓰기" }),
        h("a", { href: "/me", class: "nav-link", text: "내 글" }),
        h("button", { type: "button", class: "nav-link", text: `${me.username} · 로그아웃`, onclick: async () => {
          try { await api("/auth/logout", { method: "POST" }); } catch {}
          location.href = "/";
        } })
      );
    } else {
      nav.append(h("a", { href: "/login?next=" + encodeURIComponent(location.pathname + location.search), class: "btn sm primary", text: "로그인" }));
    }
  }

  function postCard(p, { manage = false, onDelete } = {}) {
    const badges = h("div", { class: "badges" },
      h("span", { class: "pill", text: p.category }),
      p.visibility === "private" ? h("span", { class: "pill lock", text: "🔒 나만보기" }) : h("span", { class: "pill pub", text: "공개" }));
    const main = h("a", { href: `/post?id=${p.id}`, class: "post-main" },
      badges,
      h("h3", { text: p.title }),
      h("p", { text: p.excerpt }),
      h("span", { class: "meta", text: `${p.author} · ${fmtDate(p.created_at)}` }));
    const li = h("li", null, main);
    if (manage) {
      li.append(h("div", { class: "row-actions" },
        h("a", { class: "btn sm ghost", href: `/write?id=${p.id}`, text: "수정" }),
        h("button", { class: "btn sm danger", type: "button", text: "삭제", onclick: () => onDelete(p) })));
    }
    return li;
  }

  // ---------- 페이지별 ----------
  const pages = {
    async home() {
      const cta = $("#cta");
      cta.append(me
        ? h("a", { class: "btn primary", href: "/write", text: "새 글 쓰기" })
        : h("a", { class: "btn primary", href: "/login", text: "로그인하고 글쓰기" }),
        h("a", { class: "btn ghost", href: "#posts", text: "글 둘러보기" }));

      const chips = $("#chips"), list = $("#list");
      let current = "";
      async function load() {
        list.replaceChildren(h("li", { class: "empty", text: "불러오는 중…" }));
        try {
          const { posts } = await api("/posts" + (current ? "?category=" + encodeURIComponent(current) : ""));
          list.replaceChildren(...(posts.length ? posts.map((p) => postCard(p)) : [h("li", { class: "empty", text: "아직 글이 없어요. 첫 글의 주인공이 되어 보세요!" })]));
        } catch (e) {
          list.replaceChildren(h("li", { class: "empty", text: e.message }));
        }
      }
      ["전체", ...CATEGORIES].forEach((c) => {
        const b = h("button", { type: "button", class: "chip", "aria-pressed": String(c === "전체"), text: c, onclick: () => {
          current = c === "전체" ? "" : c;
          chips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          load();
        } });
        chips.append(b);
      });
      load();
    },

    async login() {
      const next = safeNext(new URLSearchParams(location.search).get("next"));
      if (me) { location.replace(next); return; }
      const form = $("#authform"), msg = $("#msg"), submit = $("#submit");
      let mode = "login";
      const setMode = (m) => {
        mode = m;
        document.querySelectorAll("[data-mode]").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === m)));
        submit.textContent = m === "login" ? "로그인" : "가입하고 시작하기";
        $("#pw").autocomplete = m === "login" ? "current-password" : "new-password";
        $("#hint").hidden = m === "login";
        msg.textContent = "";
      };
      document.querySelectorAll("[data-mode]").forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));
      setMode("login");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submit.disabled = true; msg.textContent = "";
        try {
          await api(mode === "login" ? "/auth/login" : "/auth/signup", { method: "POST", body: { username: $("#un").value, password: $("#pw").value } });
          location.href = next;
        } catch (err) {
          msg.textContent = err.message;
          submit.disabled = false;
        }
      });
    },

    async post() {
      const box = $("#article");
      const id = new URLSearchParams(location.search).get("id");
      try {
        const { post: p } = await api("/posts/" + encodeURIComponent(id || ""));
        document.title = `${p.title} — 머니로그`;
        box.replaceChildren(
          h("div", { class: "badges" },
            h("span", { class: "pill", text: p.category }),
            p.visibility === "private" ? h("span", { class: "pill lock", text: "🔒 나만보기" }) : null),
          h("h1", { text: p.title }),
          h("p", { class: "meta", text: `${p.author} · ${fmtDate(p.created_at)}${p.updated_at !== p.created_at ? " (수정됨)" : ""}` }),
          renderBody(p.body),
          p.mine ? h("div", { class: "row-actions end" },
            h("a", { class: "btn ghost", href: `/write?id=${p.id}`, text: "수정" }),
            h("button", { class: "btn danger", type: "button", text: "삭제", onclick: async () => {
              if (!confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) return;
              try { await api("/posts/" + p.id, { method: "DELETE" }); location.href = "/me"; } catch (e) { alert(e.message); }
            } })) : null);
      } catch (e) {
        box.replaceChildren(h("p", { class: "empty", text: e.message }), h("a", { class: "btn ghost", href: "/", text: "홈으로" }));
      }
    },

    async write() {
      if (!me) { location.replace("/login?next=" + encodeURIComponent(location.pathname + location.search)); return; }
      const id = new URLSearchParams(location.search).get("id");
      const form = $("#postform"), msg = $("#msg"), submit = $("#submit");
      const cat = $("#category");
      CATEGORIES.forEach((c) => cat.append(h("option", { value: c, text: c })));
      $("#heading").textContent = id ? "글 수정" : "새 글 쓰기";
      if (id) {
        try {
          const { post: p } = await api("/posts/" + encodeURIComponent(id));
          if (!p.mine) throw new Error("내 글만 수정할 수 있어요.");
          $("#title").value = p.title; $("#body").value = p.body; cat.value = p.category;
          form.querySelector(`input[name=visibility][value=${p.visibility}]`).checked = true;
        } catch (e) { msg.textContent = e.message; form.querySelectorAll("input,select,textarea,button").forEach((x) => (x.disabled = true)); return; }
      }
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submit.disabled = true; msg.textContent = "";
        const body = { title: $("#title").value, body: $("#body").value, category: cat.value, visibility: form.visibility.value };
        try {
          const r = await api(id ? "/posts/" + id : "/posts", { method: id ? "PUT" : "POST", body });
          location.href = `/post?id=${r.id}`;
        } catch (err) { msg.textContent = err.message; submit.disabled = false; }
      });
    },

    async me() {
      if (!me) { location.replace("/login?next=/me"); return; }
      const list = $("#list");
      async function load() {
        try {
          const { posts } = await api("/posts?mine=1");
          list.replaceChildren(...(posts.length
            ? posts.map((p) => postCard(p, { manage: true, onDelete: async (x) => {
                if (!confirm(`"${x.title}" 글을 삭제할까요? 되돌릴 수 없어요.`)) return;
                try { await api("/posts/" + x.id, { method: "DELETE" }); load(); } catch (e) { alert(e.message); }
              } }))
            : [h("li", { class: "empty" }, "아직 쓴 글이 없어요. ", h("a", { href: "/write", text: "첫 글 쓰러 가기" }))]));
        } catch (e) { list.replaceChildren(h("li", { class: "empty", text: e.message })); }
      }
      load();
    },
  };

  (async () => {
    try { me = (await api("/me")).user; } catch {}
    renderNav();
    const y = $("#y"); if (y) y.textContent = new Date().getFullYear();
    const page = document.body.dataset.page;
    if (pages[page]) pages[page]();
  })();
})();
