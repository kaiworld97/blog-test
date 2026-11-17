// 운영자 계정 생성 / 비밀번호 재설정
//   node scripts/create-user.mjs <아이디> [--local|--remote]
// 비밀번호는 기본적으로 무작위로 만들어 .admin-credentials.txt 에 저장합니다 (git 제외).
// 직접 정하려면 환경변수 NEW_PASSWORD 를 지정하세요 (8자 이상).
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const username = (args.find((a) => !a.startsWith("--")) || "").toLowerCase();
const target = args.includes("--remote") ? "--remote" : "--local";
if (!/^[a-z0-9_]{3,20}$/.test(username)) {
  console.error("사용법: node scripts/create-user.mjs <아이디(영문 소문자·숫자·_ 3~20자)> [--local|--remote]");
  process.exit(1);
}

const generated = !process.env.NEW_PASSWORD;
const password = process.env.NEW_PASSWORD || randomBytes(15).toString("base64url");
if (password.length < 8) {
  console.error("비밀번호는 8자 이상이어야 합니다.");
  process.exit(1);
}

// lib/util.js 의 hashPassword 와 동일한 방식 (PBKDF2-SHA256, 100000회, salt는 문자열 그대로)
const salt = randomBytes(16).toString("hex");
const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
const now = new Date().toISOString();

const sql = `
INSERT INTO users (username, password_hash, salt, created_at) VALUES ('${username}', '${hash}', '${salt}', '${now}')
  ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, salt = excluded.salt;
DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = '${username}');
`;

const dir = mkdtempSync(join(tmpdir(), "mkuser-"));
const file = join(dir, "user.sql");
writeFileSync(file, sql);
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const r = spawnSync(npx, ["wrangler", "d1", "execute", "blog-db", target, "--yes", `--file=${file}`], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
rmSync(dir, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status ?? 1);

if (generated) {
  writeFileSync(".admin-credentials.txt", `아이디: ${username}\n비밀번호: ${password}\n(${target.slice(2)} · ${now})\n`);
  console.log(`\n계정 '${username}' 설정 완료. 비밀번호는 .admin-credentials.txt 에 저장했습니다.`);
} else {
  console.log(`\n계정 '${username}' 의 비밀번호를 설정했습니다.`);
}
