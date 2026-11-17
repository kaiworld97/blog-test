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
  const today = document.getElementById("today");
  if (today) {
    today.textContent = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
  }
  const y = document.getElementById("y");
  if (y) y.textContent = d.getFullYear();

  const copy = document.getElementById("copyfeed");
  if (copy) {
    copy.addEventListener("click", async () => {
      const input = document.getElementById("feedurl");
      const msg = document.getElementById("copy-msg");
      try {
        await navigator.clipboard.writeText(input.value);
        msg.textContent = "주소를 복사했어요.";
      } catch {
        input.select();
        msg.textContent = "주소를 길게 눌러 복사해 주세요.";
      }
    });
  }
})();
