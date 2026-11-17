# 든든한 노후경제

시니어를 위한 쉬운 경제·금융 블로그입니다. 빌드 과정이 없는 순수 정적 사이트(HTML/CSS/JS)이고, Cloudflare Pages로 배포합니다.

- 사이트: https://blog-test-a09.pages.dev
- RSS: https://blog-test-a09.pages.dev/feed.xml
- 저장소: https://github.com/kaiworld97/blog-test

## 폴더 구조

```
public/                  ← 배포되는 폴더 (Pages 출력 디렉터리)
├─ index.html            첫 화면
├─ posts/*.html          글 (파일 하나 = 글 하나)
├─ styles.css            전체 스타일 (디자인 토큰은 :root 에 있음)
├─ script.js             글자 크기 조절, 날짜, RSS 주소 복사
├─ feed.xml              RSS
├─ sitemap.xml, robots.txt
├─ 404.html
└─ _headers              보안·캐시 헤더
wrangler.toml            Pages 설정
package.json             dev / deploy 스크립트
```

## 현재 글

| 파일 | 제목 |
|---|---|
| `posts/pension-timing.html` | 국민연금, 언제 받는 게 가장 유리할까요? |
| `posts/deposit-protection.html` | 예금자보호 한도 1억 원, 정확히 어떻게 적용되나요 |
| `posts/voice-phishing.html` | 보이스피싱, 이 세 가지 말이 나오면 끊으세요 |
| `posts/health-insurance-retirement.html` | 은퇴하면 건강보험료는 어떻게 달라지나요 |
| `posts/deposit-interest.html` | 금리가 내려갈 때 예금, 이자는 이렇게 계산합니다 |

## 새 글 쓰는 법

1. `public/posts/` 의 기존 글을 복사해 새 파일을 만들고 제목, 본문, 날짜를 바꿉니다.
2. `public/index.html` 의 "최신 글" 목록에 항목을 추가합니다.
3. `public/feed.xml` 에 `<item>` 을, `public/sitemap.xml` 에 `<url>` 을 추가합니다.
4. 금액·비율·제도 설명은 반드시 해당 기관 공식 자료로 확인하고, 글 맨 아래 "참고" 출처를 적습니다.

## 로컬에서 보기

```bash
npm install
npm run dev
```

## 배포

### GitHub 연동 (자동 배포)
`main` 브랜치에 push 하면 Cloudflare Pages가 자동 배포하도록 연결할 수 있습니다.
Cloudflare 대시보드 → Workers & Pages → `blog-test` → Settings → Builds & deployments 에서 Git 저장소를 연결하고 아래처럼 설정하세요.

- Framework preset: `None`
- Build command: (비워둠)
- Build output directory: `public`

### 수동 배포 (Wrangler)
```bash
npx wrangler login
npm run deploy
```
Pages 프로젝트 `blog-test` 는 이미 만들어져 있습니다.

## 알아둘 점

- "꼭 알아둘 숫자"와 글 속 제도 정보는 2026년 11월 기준입니다. 제도가 바뀌면 글과 숫자를 함께 고쳐야 합니다.
- 글은 일반 정보이며 투자 권유가 아닙니다. 푸터에 안내 문구가 있습니다.
- 글자 크기 설정은 방문자의 브라우저에만 저장됩니다.
