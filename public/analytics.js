// Google Analytics 4 (공개 페이지에서만 로드: 홈, 글 상세)
// 사용법: 아래 GA_ID 에 측정 ID(G-XXXXXXXXXX)를 넣고 재배포하면 켜집니다. 비워 두면 아무것도 전송하지 않습니다.
(function () {
  var GA_ID = "G-JFCEXBGL26";

  // 다른 스크립트가 안전하게 호출하는 이벤트 함수 (GA가 꺼져 있어도 오류 없음)
  window.track = function () {};

  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) return;
  // 브라우저의 추적 금지(DNT) 설정을 존중
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  window.track = function (name, params) { gtag("event", name, params || {}); };
  gtag("js", new Date());
  gtag("config", GA_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
})();
