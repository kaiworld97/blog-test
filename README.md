# 작은 서재 (blog-test)

빌드 과정이 없는 순수 정적 사이트입니다. 배포 대상 폴더는 `public/` 입니다.

## 로컬 미리보기
```bash
npm install
npm run dev
```

## Cloudflare Pages 배포

### 방법 A. Wrangler (CLI)
```bash
npx wrangler login
npm run deploy
```
첫 배포 시 프로젝트가 없으면 생성 여부를 물어봅니다 (production branch: `main`).

### 방법 B. Git 연동 (자동 배포)
Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git
- Framework preset: `None`
- Build command: (비워둠)
- Build output directory: `public`

## 구조
- `public/index.html` 첫 화면
- `public/styles.css`, `script.js` 스타일/동작 (다크모드 포함)
- `public/_headers` 보안·캐시 헤더
- `public/404.html` 404 페이지
- `wrangler.toml` Pages 설정
