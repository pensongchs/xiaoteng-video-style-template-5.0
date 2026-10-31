#!/bin/zsh
cd "$(dirname "$0")" || exit 1
printf '系统：macOS %s；芯片：%s\n' "$(sw_vers -productVersion)" "$(uname -m)"
if ! command -v node >/dev/null 2>&1; then
  printf '请让 Codex 安装 Node.js 24 LTS，对应此芯片：\nhttps://nodejs.org/en/download/\n'
  exit 1
fi
node scripts/setup.cjs
