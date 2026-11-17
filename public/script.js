(() => {
  const root = document.documentElement;
  const sizes = { "-1": 0.9, "0": 1, "1": 1.2 };
  const btns = document.querySelectorAll(".fs button");

  function apply(key) {
    root.style.setProperty("--fs", sizes[key]);
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fs === key)));
  }
  let saved = "0";
  try { saved = localStorage.getItem("fs") || "0"; } catch {}
  apply(saved in sizes ? saved : "0");

  btns.forEach((b) =>
    b.addEventListener("click", () => {
      apply(b.dataset.fs);
      try { localStorage.setItem("fs", b.dataset.fs); } catch {}
    })
  );

  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  document.getElementById("today").textContent =
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
  document.getElementById("y").textContent = d.getFullYear();

  // 구독 폼은 데모입니다. 실제 서비스(Buttondown, Formspree 등) 연결 시 교체하세요.
  document.getElementById("news").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("news-msg").textContent = "구독해 주셔서 감사합니다. (데모)";
    e.target.reset();
  });
})();
