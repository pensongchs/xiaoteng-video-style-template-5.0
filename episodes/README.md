# episodes — 每期输入

每期一期一目录，建议：

```text
episodes/<期名>/
  文案.md          # 口播全文（含片头钩子句 + 正片正文）
  音频.mp3 / .wav  # 口播音频（有则放）
  字幕.srt         # 带时间码字幕（有则放）
  备注.md          # 可选：片头指定范围、城市、素材偏好
```

## 怎么用（5.0 定版 2026-10-31）

1. 配音 → `/workspace/时间码字幕2.0/run-box.sh` 出逐字时间码 → 校对对齐。
2. 把音频、SRT/Caption JSON、`shots.ts`、`片头/校对后_动效时间轴_绝对.json`、`片头/keys.txt`（可选 `片头/EpisodeOpening.tsx`）放进 `正片/template/episodes/<期名>/`，结构照参考期 `选楼层口诀`。`shots.ts` 里的 `layout` 只能是 `正片/template/src/style/layouts.ts` 已登记的官方版式，并由官方 `ShotView` 渲染。片头仍走 `片头/`，不要把 opening 写进正片版式。
3. `node scripts/build-episode.mjs <期名> --audio=<整期配音.mp4>` → `episodes_work/<期名>/<期名>_成品.mp4`，并复制到 `outputs/成片/<期名>/`。
