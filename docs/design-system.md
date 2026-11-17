# 머니로그 디자인 시스템

사이트의 색, 글자, 간격, 모서리, 컴포넌트 규칙을 한곳에 정리한 문서입니다. 실제 값은 `public/styles.css`의 `:root`에 있고, Claude 아티팩트의 디자인 시스템(`tokens.json`)과 같은 값입니다.

- 디자인 시스템 아티팩트: https://claude.ai/artifact/SDHqqxh6dFtSqtTFb375m5
- 5개 화면 시안: https://claude.ai/artifact/FHS9C9sv8e8KEi6QUYMocA

> 두 링크는 처음에는 만든 사람만 열 수 있습니다. 다른 사람에게 보여 주려면 아티팩트 페이지의 공유(Share) 메뉴에서 공유해야 합니다.

## 색

| 토큰 | 값 | 용도 |
|---|---|---|
| `bg` | `#f4f6fa` | 페이지 바탕 |
| `surface` | `#ffffff` | 카드, 헤더, 폼 |
| `text` | `#191f28` | 제목, 본문 |
| `sub` | `#4e5968` | 보조 글, 요약 |
| `hint` | `#6b7684` | 날짜, 작성자 (흰 바탕 위에서만) |
| `primary` | `#2563eb` | 주요 버튼, 링크, 로고 마크, 포커스 링 |
| `primary-d` | `#1d4ed8` | 호버, 연한 파랑 바탕 위 글자 |
| `tint` | `#e8f0ff` | 카테고리 배지, 보조 버튼, 선택 상태 |
| `mint` / `mint-tint` | `#0b7a5c` / `#e1f7ef` | "공개" 배지, 성공 메시지 |
| `danger` / `danger-tint` | `#c4252f` / `#fdecee` | 삭제 버튼, 오류 메시지 |
| `line` | `#e3e7ee` | 칩 윤곽, 목록 구분선 |

글자와 바탕의 대비는 4.5:1 이상으로 맞췄습니다. 배지처럼 색으로 구분하는 요소에는 항상 글자("공개", "나만보기")를 함께 씁니다.

## 글자

글꼴은 Pretendard Variable(대체: 맑은 고딕, 시스템 글꼴)입니다. 기본 글자 크기는 17px입니다.

| 스타일 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `display` | 56px | 800 | 홈 첫 문구 |
| `heading` | 35px | 800 | 글 제목, 페이지 제목 |
| `title` | 26px | 800 | 섹션 제목 |
| `card-title` | 20px | 700 | 목록 카드 제목 |
| `body` | 17px | 400 | 본문 (글 본문은 줄 간격 1.95) |
| `small` | 14px | 400 | 요약, 도움말 |
| `meta` | 13px | 400 | 작성자·날짜 |
| `label` | 12px | 700 | 배지 |

## 간격과 모서리

- 간격은 8px 단위: `space-1` 8, `space-2` 16, `space-3` 24, `space-4` 32, `space-5` 48, `space-6` 72 (폰에서는 섹션 간격 56).
- 모서리: `radius-sm` 12 (작은 버튼), `radius-md` 16 (버튼·입력·목록 카드), `radius-lg` 24 (폼·글 카드), `radius-pill` 999 (배지·칩).
- 그림자는 목록 카드 호버에만 씁니다: `0 8px 24px rgba(25,31,40,.08)` + 위로 2px.

## 컴포넌트

| 컴포넌트 | 규칙 |
|---|---|
| Button | 화면마다 primary는 하나. ghost는 보조, danger는 삭제(글자 라벨 필수). 높이 52px 이상, 작은 버튼 40px 이상 |
| Pill | 카테고리(`tint`), 공개(`mint-tint`), 나만보기(회색). 12px 굵게 |
| Chip | 카테고리 필터. 선택은 `text` 바탕 + 흰 글자, `aria-pressed` |
| PostCard | 배지 → 제목 → 요약 2줄 → 작성자·날짜. 내 글에서는 수정·삭제 버튼 |
| FormField | 라벨은 입력창 위. 입력창은 `bg` 바탕, 포커스 시 `primary` 2px 테두리 |

## 화면 시안과 실제 사이트

| 화면 | 시안 파일 | 실제 파일 |
|---|---|---|
| 첫 화면 | `Main.dc.html` | `public/index.html` |
| 글 목록 | `List.dc.html` | `public/index.html`(공개), `public/me.html`(내 글) |
| 글 상세 | `Post.dc.html` | `public/post.html` |
| 글쓰기 | `Write.dc.html` | `public/write.html` |
| 관리자 로그인 | `Login.dc.html` | `public/login.html` |

## 시안과 사이트의 차이

- 시안은 나만보기 배지에 자물쇠 그림(SVG)을, 사이트와 디자인 시스템 미리보기는 🔒 글자를 씁니다. 하나로 맞추려면 사이트에 SVG 아이콘을 추가하면 됩니다.
- 시안은 Pretendard 대신 Noto Sans KR로 보입니다(아티팩트에서 Pretendard를 불러올 수 없기 때문).
- 시안의 글 목록 화면은 로그인한 상태(수정·삭제 버튼 포함)를 보여줍니다.

## 값을 바꿀 때

1. `public/styles.css`의 `:root` 값을 고칩니다.
2. 디자인 시스템 아티팩트의 `tokens.json`과 이 문서를 같은 값으로 고칩니다.
3. 글자와 바탕의 대비가 4.5:1 이상인지 확인합니다.
