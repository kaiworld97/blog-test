# 머니로그

사회초년생(청년)을 위한 돈 이야기 블로그입니다. **운영자 한 명**만 로그인해서 글을 쓰고, 글마다 **공개 / 나만보기**를 고를 수 있습니다. 회원가입은 없습니다.

- 프런트: 정적 HTML/CSS/JS (`public/`)
- 백엔드: Cloudflare **Pages Functions** (`functions/`)
- 데이터: Cloudflare **D1** (SQLite)
- 저장소: https://github.com/kaiworld97/blog-test
- 디자인: [docs/design-system.md](docs/design-system.md) · [디자인 시스템](https://claude.ai/artifact/SDHqqxh6dFtSqtTFb375m5) · [5개 화면 시안](https://claude.ai/artifact/FHS9C9sv8e8KEi6QUYMocA) (아티팩트 링크는 공유하기 전에는 만든 사람만 열 수 있음)

## 기능

| 기능 | 설명 |
|---|---|
| 글 목록 | 공개 글만 최신순, 카테고리 필터 |
| 글 보기 | 공개 글은 누구나. 나만보기 글은 운영자만 (그 외에는 404) |
| 로그인 | 운영자 계정 1개. 아이디 + 비밀번호 (PBKDF2-SHA256 해시, HttpOnly 세션 쿠키 14일) |
| 글쓰기·수정·삭제 | 로그인 필요 |
| 내 글 | 공개·나만보기 글 모두 관리 |

본문은 간단한 서식을 지원합니다: `## 소제목`, `- 목록`, `**굵게**`, 빈 줄 = 문단. HTML은 실행되지 않고 글자 그대로 표시됩니다.

## 구조

```
public/            정적 파일 (배포 폴더)
├─ index.html      홈 (공개 글 목록)
├─ login.html      운영자 로그인
├─ write.html      글쓰기·수정 (?id= 로 수정)
├─ post.html       글 보기 (?id=)
├─ me.html         내 글 관리
├─ app.js          공용 스크립트 (페이지별 로직)
├─ styles.css      스타일 (디자인 토큰은 :root)
└─ _headers        보안 헤더 (CSP 포함)
functions/api/     API (Pages Functions)
├─ auth/{login,logout}.js
├─ me.js
└─ posts/{index,[id]}.js
lib/util.js        공용 헬퍼 (해시, 세션, 검증)
docs/design-system.md  디자인 시스템 (색·글자·간격·컴포넌트)
docs/user-stories.md   사용자 스토리와 인수 조건
schema.sql         DB 스키마
seed.sql           예시 글 3개 + 'admin' 계정(비밀번호 비활성)
scripts/create-user.mjs  운영자 비밀번호 설정/재설정
wrangler.toml      Pages + D1 바인딩
```

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/me` | 현재 로그인 사용자 (`user: null` 이면 비로그인) |
| POST | `/api/auth/login` | `{username, password}` |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/posts?category=` | 공개 글 목록 |
| GET | `/api/posts?mine=1` | 내 글 전체 (로그인) |
| POST | `/api/posts` | `{title, body, category, visibility}` 작성 |
| GET | `/api/posts/:id` | 글 1개 |
| PUT | `/api/posts/:id` | 수정 (작성자) |
| DELETE | `/api/posts/:id` | 삭제 (작성자) |

`visibility` 는 `public` 또는 `private`. 쓰기 요청은 같은 출처(Origin)에서 온 것만 허용합니다.

## 로컬 실행

```bash
npm install
npm run db:local   # 로컬 DB 생성 + 예시 글 + admin 계정(비활성)
NEW_PASSWORD=원하는비밀번호 npm run user -- admin --local   # 로컬 비밀번호 설정
npm run dev        # http://localhost:8788
```

## 배포 (Cloudflare Pages + D1)

처음 한 번만:

```bash
npx wrangler login
npx wrangler d1 create blog-db
```

출력된 `database_id` 를 `wrangler.toml` 의 `database_id` 에 넣고:

```bash
npm run db:remote   # 원격 DB에 테이블 + 예시 글 생성
npm run deploy      # Pages 배포
npm run user -- admin --remote   # 운영자 비밀번호 설정 (무작위 생성 → .admin-credentials.txt)
```

이후 코드만 바꿨다면 `npm run deploy` 만 하면 됩니다.
GitHub 연동 자동 배포를 쓰려면 Pages 프로젝트의 Settings → Bindings 에서 D1 바인딩 `DB` → `blog-db` 를 연결하고, 빌드 출력 디렉터리를 `public` 으로 지정하세요 (빌드 명령은 비움).

## 운영자 계정

- 계정은 `admin` 하나뿐이고, 가입 기능은 없습니다.
- 비밀번호를 바꾸려면 직접 정해서 실행하세요 (기존 로그인 세션은 모두 종료됩니다):

```bash
NEW_PASSWORD=새비밀번호 npm run user -- admin --remote
```

  PowerShell 에서는 `$env:NEW_PASSWORD="새비밀번호"; npm run user -- admin --remote`
- `NEW_PASSWORD` 없이 실행하면 무작위 비밀번호가 만들어져 `.admin-credentials.txt` 에 저장됩니다 (git 제외). 확인 후 파일은 지우세요.

## 알아둘 점

- 로그인 시도 횟수 제한은 없습니다. 긴 비밀번호를 쓰고, 필요하면 Cloudflare Rate Limiting 규칙을 `/api/auth/login` 에 추가하세요.
- 비밀번호 찾기 기능은 없습니다. 잊으면 위 명령으로 재설정하세요.
- 글 목록은 최근 50개(내 글은 100개)까지만 보여줍니다. 페이지네이션은 없습니다.
- 나만보기 글도 DB에는 평문으로 저장됩니다.

## SEO · 분석(GA)

- **메타 태그**: 홈은 `public/index.html`, 글 상세는 `functions/post.js`가 글마다 title·description·canonical·Open Graph·Twitter 카드·JSON-LD(BlogPosting)를 채워 응답합니다. 나만보기·없는 글은 `noindex`입니다.
- **미리보기 이미지**: `public/og-image.png`(1200×630), `public/apple-touch-icon.png`
- **sitemap.xml**: `functions/sitemap.xml.js`가 공개 글만 자동으로 나열합니다. `robots.txt`에서 로그인·글쓰기·내 글·API는 막습니다.
- **GA4**: `public/analytics.js`의 `GA_ID`에 측정 ID(`G-XXXXXXXXXX`)를 넣고 재배포하면 켜집니다. 홈과 글 상세에서만 동작하고, 브라우저의 추적 금지(DNT) 설정을 따릅니다.
- **도메인을 바꿀 때**: `lib/site.js`의 `SITE_URL`, `public/index.html`·`public/robots.txt`의 `blog-test-a09.pages.dev`를 함께 바꿉니다.
