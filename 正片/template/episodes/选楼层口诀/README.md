# 参考期 · 选楼层口诀（5.0 定版 2026-10-31）

老板确认的 5.0 标准成片。新一期照这个目录结构准备即可。

| 文件 | 作用 |
|---|---|
| `audio.m4a` + `subs.srt` + `captions.json` | 正片口播与逐字字幕（`npm run episode -- 选楼层口诀` 生成 episode.json） |
| `shots.ts` | 分镜：版式 + `anchors`（关键词 → 元素随口播入场；`media` 锚点控制图卡） |
| `片头/校对后_动效时间轴_绝对.json` | 时间码字幕2.0 输出，第 1 句驱动片头 |
| `片头/keys.txt` | 片头节拍关键词：`slam:选,tilt:照,x0:很,x1:可能,x2:把,title:带` |
| `片头/EpisodeOpening.tsx` | 本期片头文案（口诀表 / 标题）；新一期复制后改文案即可 |
| `配音v2.mp4` | 整期配音（片头 + 正片），混流用 |

复现：
```bash
export PATH=~/.local/node22/bin:$PATH
cd /workspace/小滕分镜风格5.0版本
node scripts/build-episode.mjs 选楼层口诀 --audio=正片/template/episodes/选楼层口诀/配音v2.mp4 --dur=98.0
```
产物：`episodes_work/选楼层口诀/选楼层口诀_成品.mp4`（98.0s，2940 帧，AAC，起点 0），并复制到 `outputs/成片/选楼层口诀/`。
