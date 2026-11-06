---
name: 小滕分镜风格5.0版本
description: 董事长自用的一体化视频模板（本地，不上传 GitHub）。一期文案分成「片头」和「正片」两部分：片头用内置的小滕片头风格（大厂深空质感背景：深空冷色+soft glow、极淡网格与斜高光扫、玻璃卡片抠像、平滑缓动；去土黄）、按主题生成且颜色自然的透明抠像、冷白银与冷香槟银标题、图文接力），正片用5.0新定版（玻璃v6 + 房产MG）（深色电影感、暖金点缀、轻量 MG、音画同步、精致字幕），最后自动拼成一条带声音的 1920×1080 成片。
---

# 小滕分镜风格 5.0 新定版（玻璃v6 + 房产MG）

> **5.0 新定版（玻璃v6 + 房产MG）**：已定，2026-11-06（Asia/Shanghai）。正片所有GLASS/FROST/glassMat与旧存档卡统一经典薄玻璃；主底alpha .68–.74、细白边/轻顶光、轻tint，无颗粒/厚斜面/到位弹/僵硬扫光。不是旧v5厚边版本。
> 默认26种（核心10+数据7+已定房产9），旧6套与unitCompare仅存档。轮换及准确参数以 `正片/references/版式目录.md`、`风格设计规范.md` 为准。
> 配音→逐字时间码→校对对齐→镜头表/anchors→检查→stills→render→一体拼接/混流。原片头、独立4.5与旧定版成片不变。本地定版，不自动上传/推送/外发。

本模板是自包含的：`片头/` 和 `正片/` 都是完整拷贝，不依赖、也不修改任何 GitHub 仓库或其他本地目录。

```
小滕分镜风格5.0版本/
├─ SKILL.md            ← 本文件（总流程）
├─ 片头/               ← 小滕片头风格模板（原 SKILL.md、母工程 assets/workspace、脚本、字体）
├─ 正片/               ← 5.0 新定版（玻璃v6 + 房产MG；template/ Remotion 工程、references）
├─ scripts/concat.mjs  ← 片头 + 正片 拼成一条成片
├─ episodes/<期名>/     ← 每期输入：文案、音频、SRT/Caption JSON
└─ outputs/
   ├─ 片头制作专用/     ← 片头母工程（第一次用时由片头脚本创建）
   └─ 成片/<期名>/      ← 片头.mp4、正片.mp4、成片.mp4
```

## 每期流程
董事长交文案时会标明哪段是**片头**、哪段是**正片**，按标注分开做，不要自行挪动分界。

### 0. 收料
把文案、口播音频、时间码字幕放进 `episodes/<期名>/`。按董事长标注，在字幕里找到片头和正片的分界时间（毫秒），记在 `episodes/<期名>/分段.md`。之后片头和正片各自从分界点换算相对时间。

### 1. 片头（先做）
完全按 `片头/SKILL.md` 执行，路径对应关系：
- `SKILL_ROOT` = `小滕分镜风格5.0版本/片头`
- 母工程 = `outputs/片头制作专用/`（没有时运行 `node 片头/scripts/create-project.mjs outputs`，后续每期复用）
- 范围 = 片头那段文案和时间码；按片头规则做纯画面（默认 50fps、无字幕无配音，口播在拼接时由音频补上，见第 3 步）。
- 背景：大厂深空质感——深空冷色（#07090f→#0c1220）+冷青蓝/靛紫 soft glow；极淡产品网格与换位斜高光扫；住宅进半透明玻璃卡片；强调色电青#7aa2ff与冷香槟银#c5b89a；平滑缓动；无纸纹、无杂志相框、无土黄粗金条、无阶跃错位色板。
- 抠像：按当期主题生成对应透明抠像（不固定楼），颜色自然不过艳（约 saturate 0.85–0.9）。
- 渲染后 `npm run verify`，输出复制为 `outputs/成片/<期名>/片头.mp4`。

### 2. 正片（片头完成后再做）
完全按 `正片/SKILL.md`（5.0 新定版）执行，Remotion 工程在 `正片/template/`。只用正片那段文案、音频和字幕：
校对字幕（只改字不改时间码）→ 镜头表 → 找白天 1080p 中国城市航拍（优先当地）→ 生图 → shots.ts → `npm run check` → `npm run stills` → `npm run render`。
输出复制为 `outputs/成片/<期名>/正片.mp4`。

### 3. 拼成一条
```
node scripts/concat.mjs outputs/成片/<期名>/片头.mp4 outputs/成片/<期名>/正片.mp4 outputs/成片/<期名>/成片.mp4
```
脚本把两段统一成 1920×1080 / 30fps / H.264 + AAC 后接成一条；片头没有音轨时自动补静音。
- 如果片头那段也有口播：先用 ffmpeg 把片头口播音频合进 `片头.mp4`（`-map 0:v -map 1:a -shortest`），再拼接，这样声音从第一秒就连上。
- 拼完用 `ffprobe` 确认有视频和 aac 音频流、总时长 ≈ 片头 + 正片，并在接缝前后各截一帧检查画面。

### 4. 交付
交付 `成片.mp4`，同时保留 `片头.mp4`、`正片.mp4` 方便单独改。说明哪些是媒体检查、哪些需要董事长亲自看。

## 规则
- 两部分各自的设计规则以各自 SKILL.md 为准（片头看 `片头/assets/workspace/DESIGN.md`，正片看 `正片/references/`），片头保持原样；正片以本次5.0新定版规范为准。
- 不写死城市名和人名，按每期文案安排。
- 依赖复用：两套工程沿用各自 setup 的复用逻辑，不在每期目录重复安装。
- 本模板只存在于本地，不推送 GitHub。
- 5.0 背景比 4.5 更亮，不要特别暗：正片背景 brightness 1.2、压暗层 max(0.13, dark−0.26)，渐变只留标题区和字幕区；可读性靠文字柔和投影，不靠整屏压黑。
- 正片可用 7 种数据版式（lineReveal / barGlow / rankBars / waffle / balance / yearRing / formulaCalc），用法和次数限制见 `正片/SKILL.md`，数字必须核算。
- 片尾默认 `outroHost`：左侧小滕挥手卡通（`正片/template/public/media/character/xiaoteng_outro.png`）+ 右侧按当期片尾文案分层排版（主标题→要点→收尾句→小字署名），沿用正片视觉；**禁止**点赞/关注/收藏/转发类引导语和按钮式 CTA。小样：`OutroSample` 合成。

## 5.0 新定版（玻璃v6 + 房产MG）· 默认版式与轮换
状态：**已定**，2026-11-06（Asia/Shanghai）。本节替代此前“待审/旧6套强制/到位后持续呼吸”等条款。

默认 **26种逻辑版式**（`outroAir` 仅为 `outroHost` 别名，不重复计数）：
- 原核心10：`titleFloat / bareNumber / splitVs / timeline / mediaRows / quoteStack / ringFeature / waitVs / triadSoft / outroHost`。
- 数据7：`lineReveal / barGlow / rankBars / waffle / balance / yearRing / formulaCalc`。
- 房产已定9：`floorLadder / paymentSplit / amenityOrbit / pitfallBoard / priceStep / decisionFork / districtTags / loanDial / layerReveal`。
- 旧6套只存档：`keywordCascade / checklistFill / vsScore / tipStack / numberedReveal / kpiGrid`。材质已同步v6，但不自动推荐、不进入默认gallery。
- `unitCompare` 仅保留实现存档；不在 LayoutName、默认推荐、预览或轮换计数中。

执行条款：
1. 标准8–12镜一期至少7种版式，其中至少2种不同的已定房产MG；短片少于7镜时不硬凑7种，逐镜不重复，优先安排1种语义匹配的房产MG。禁止为凑数量造数据。
2. 同一版式每期最多2次（片尾仅1次）；相邻镜不得同版式，重复时中间至少隔2镜；别名合并计数。切换数字、流程、清单、图文、对比等信息结构，不只换标题。
3. 真实数字/比例/金额至少1镜用数据图表、bareNumber/ringFeature，或匹配的 paymentSplit/priceStep/loanDial。7种数据图表合计每期≤3镜，同一种≤1镜，不相邻连用；数字先核算，示例显式标注，不能把示例用于实际楼盘判断。
4. 清单/避坑优先 pitfallBoard、layerReveal，配合 quoteStack/mediaRows；楼层用 floorLadder，预算用 paymentSplit/priceStep，配套/区域用 amenityOrbit/districtTags；评分、热度必须有来源和口径，没数据就不造分。
5. 对比/决策轮换 decisionFork、splitVs、waitVs，真实总账可用 balance；禁止默认使用 unitCompare 或旧 vsScore。
6. 背景优先清晰视频，静图背景占比≤1/3；不整屏模糊，bg.blur=0，靠冷灰玻璃和字影保证可读。
7. 卡片按口播锚点单调入场，16/20/12帧后精确停稳；禁止过冲、落地二次弹、邻居让位、整体呼吸/焦点缩放、僵硬扫光条。高亮只改变轻色光/文字亮度；数据绘制、进度填充、背景自然运镜与小滕人物摆手可保留，不让卡片整体晃动。

唯一登记：`src/style/layouts.ts` 的 DEFAULT_LAYOUTS（10+7+9）；默认活目录 `src/gallery/shots-mg-gallery.ts` / `MgGallery`，每个默认版式一镜。房产子集 `shots-mg-re10.ts` / `MgGalleryRe10` 固定9镜、40.5秒；“re10”仅兼容旧文件名，不代表10套。
检查：`npm run check:freeze` 验证材质、动效范围、默认/存档边界和gallery覆盖；正式出片还须 `npm run check`、stills/音画核验。新增版式必须先登记样镜并审核，不能直接加进默认清单。
