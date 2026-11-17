// 사이트 공통 정보. 도메인을 바꾸면 SITE_URL과 public/*.html 의 절대 주소를 함께 바꾸세요.
export const SITE_URL = "https://blog-test-a09.pages.dev";
export const SITE_NAME = "머니로그";
export const SITE_DESC = "월급 관리, 저축, 투자 입문, 연말정산까지. 직접 겪고 배운 돈 이야기를 기록합니다.";
export const OG_IMAGE = `${SITE_URL}/og-image.png?v=2`;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function toIso(s) {
  const d = new Date(/[TZ]/.test(s) ? s : String(s).replace(" ", "T") + "Z");
  return isNaN(d) ? undefined : d.toISOString();
}
