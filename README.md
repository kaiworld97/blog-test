# 머니로그

사회초년생(청년)을 위한 돈 이야기 블로그입니다. 회원가입·로그인한 사람만 글을 쓰고, 글마다 **공개 / 나만보기**를 고를 수 있습니다.

- 프런트: 정적 HTML/CSS/JS (`public/`)
- 백엔드: Cloudflare **Pages Functions** (`functions/`)
- 데이터: Cloudflare **D1** (SQLite)
- 저장소: https://github.com/kaiworld97/blog-test

## 기능

| 기능 | 설명 |
|---|---|
| 글 목록 | 공개 글만 최신순, 카테고리 필터 |
| 글 보기 | 공개 글은 누구나. 나만보기 글은 작성자만 (다른 사람에게는 404) |
| 회원가입·로그인 | 아이디 + 비밀번호 (PBKDF2-SHA256 해시, HttpOnly 세션 쿠키 14일) |
| 글쓰기·수정·삭제 | 로그인 필요, 본인 글만 수정·삭제 가능 |
| 내 글 | 공개·나만보기 글 모두 관리 |

본문은 간단한 서식을 지원합니다: `## 소제목`, `- 목록`, `**굵게**`, 빈 줄 = 문단. HTML은 실행되지 않고 글자 그대로 표시됩니다.

## 구조

```
public/            정적 파일 (배포 폴더)
├─ index.html      홈 (공개 글 목록)
├─ login.html      로그인 / 회원가입
├─ write.html      글쓰기·수정 (?id= 로 수정)
├─ post.html       글 보기 (?id=)
├─ me.html         내 글 관리
├─ app.js          공용 스크립트 (페이지별 로직)
├─ styles.css      스타일 (디자인 토큰은 :root)
└─ _headers        보안 헤더 (CSP 포함)
functions/api/     API (Pages Functions)
├─ auth/{signup,login,logout}.js
├─ me.js
└─ posts/{index,[id]}.js
lib/util.js        공용 헬퍼 (해시, 세션, 검증)
schema.sql         DB 스키마
seed.sql           예시 글 3개 (로그인 불가 계정 'moneylog' 소유)
wrangler.toml      Pages + D1 바인딩
```

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/me` | 현재 로그인 사용자 (`user: null` 이면 비로그인) |
| POST | `/api/auth/signup` | `{username, password}` 가입 후 로그인 |
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
npm run db:local   # 로컬 DB 생성 + 예시 글
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
```

이후 코드만 바꿨다면 `npm run deploy` 만 하면 됩니다.
GitHub 연동 자동 배포를 쓰려면 Pages 프로젝트의 Settings → Bindings 에서 D1 바인딩 `DB` → `blog-db` 를 연결하고, 빌드 출력 디렉터리를 `public` 으로 지정하세요 (빌드 명령은 비움).

## 알아둘 점 (테스트용 구현)

- 회원가입은 누구나 가능합니다. 스팸 방지(속도 제한, 이메일 인증)는 없습니다. 공개 운영 전에 Cloudflare Turnstile 이나 Rate Limiting 규칙을 붙이세요.
- 비밀번호 찾기 기능은 없습니다.
- 글 목록은 최근 50개(내 글은 100개)까지만 보여줍니다. 페이지네이션은 없습니다.
- 나만보기 글도 서버(DB)에는 평문으로 저장됩니다. 민감한 정보는 적지 마세요.
