---
name: 小滕分镜风格5.0正片
description: 用 Remotion 做 1920×1080 横屏的「深色电影感 + 暖金点缀 + 轻量 MG」知识科普分镜视频（房产、财经、城市科普等）。适用场景：用户给一段口播文案、一期选题，或者口播音频加带时间码的字幕（SRT / Caption JSON），想要小滕风格（5.0 新定版：玻璃v6 + 房产MG）的分镜画面、定格图或成片；或者要在不同城市、不同期号之间复用这套风格。包含音画同步（镜头按字幕时间码切换、图卡和文字在对应口播起音时入场）、精致的烧录字幕、版式选择思路、12 栏网格、自动排版检查、防顿帧转场，可在 Windows 和 Mac 上直接运行。
---

# 5.0 新定版（玻璃v6 + 房产MG）· 正片 SKILL

> 已定：2026-11-06（Asia/Shanghai）。2026-11-12 起卡片材质是暖雾磨砂 v6.1（卡内 blur 26px，香槟/暖纸填充，深墨字，背景不虚化）。入场 16/18/20/12 帧，到位停稳，无回弹。默认 26 种仍在，房产 9 套仍在，另有 17 款新卡进选卡池。字幕保持 main：40px、`#F4EEE4`、当前词 `#F3D79E`、距底 44px。
> 工作流和音画同步沿用；玻璃/动效/版式不得照历史成片还原旧液态风。先 `npm run check:freeze`，再按本期数据做check/stills/render。

**这套风格的样子**：背景是深色、提亮过的城市实拍视频，前景是暖白文字加一处金色强调，用不加卡片的大数字、时间轴、圆环、编号条目等轻量 MG 讲清楚一个点。镜头在口播说到对应句子时切换，数字和图文随对应口播开始入场，底部是一行磨砂浅底的精致字幕。镜头之间用 8–15 帧的克制转场，背景视频全程不停。

预览图：`references/preview/联系表.jpg`（10 个镜头的总览），以及 `S01–S10.jpg`。

## 快速开始
```bash
cd template
npm run setup          # 优先复用已有的 node_modules，没有才 npm install；同时下载演示素材
npm run episode -- demo  # 读取 episodes/demo/ 的音频和字幕，生成音画同步时间轴
npm run stock:verify   # 校验视频素材：≥1080p、帧率、时长、不重复、已登记
npm run check          # 静态检查加 DOM 排版检查（全部 ✓ 才继续）
npm run stills         # 输出 out/stills/S01–S10.png 和 out/联系表.png
npm run render         # 输出带声音和字幕的 out/成片.mp4（--no-subs 不烧字幕）；只渲前 3 秒可以用 npm run render -- --frames=0-89
npm run studio         # 打开 Remotion Studio 预览
```
- 需要 Node ≥ 22.18（脚本直接 import .ts 文件）。Windows、macOS、Linux 都用同一套 Node 脚本，不依赖 bash。
- **复用依赖**：`setup` 会依次查找 ① 环境变量 `XT_SHARED_NODE_MODULES`，② 往上 6 层父目录里的 `node_modules`，③ 同级目录（例如你已经装好的其他小滕模板）里的 `node_modules`。只要 remotion、@remotion/*、react、react-dom 的版本和 package.json **完全一致**，就链接过来复用（Windows 用 junction，Mac 用符号链接），不用重新下载。都找不到才执行 `npm install`。想强制重新安装用 `node scripts/install.mjs --force-install`。
- 浏览器：Remotion 会自动下载 Chrome Headless Shell。如果网络不通，可以设置 `REMOTION_BROWSER=本机 Chrome 的可执行文件路径`。
- 字体：阿里巴巴普惠体和阿里健康体已经放在 `public/fonts`。Arial Bold 不能随包分发，`setup` 会从系统字体里复制一份；Mac 和 Windows 自带这个字体，系统里没有时会自动用 Helvetica 等字体代替。

## 做一期新视频的完整流程
顺序：音频 + 字幕 → 校对字幕 → 镜头表（绑定到句子）→ 找视频素材 → 生成概念图 → shots.ts → check → stills → render
详细规则见 `references/音画同步与字幕.md`。
1. **收音频和字幕**：把学员给的口播音频和带时间码的字幕（`.srt`，和/或 Remotion Caption 逐词 `.json`）放进 `template/episodes/<期名>/`。学员只有音频时，用他们的「生成带时间码字幕」工具生成。然后 `npm run episode -- <期名>`。
2. **校对字幕**：语音识别的字一定要对照口播稿校对。**只改文字不改时间码**；同音错字（月工→月供、汽税→契税）改掉；被拆开的小数（「30」「6万」）合并成一句。
3. **写镜头表**：按段落把字幕分成 8–12 个镜头，每个镜头写清楚**从第几句开始**（`at: {cue: N}`）。切点放在句子开头、最好是段落开头；每镜 4–9 秒，最少 1.2 秒。每个镜头判断内容类型，按「版式选择」挑版式，**相邻两个镜头不用同一种版式和同一种主动画**。再给图卡、文本框和要点写**动效锚点**。整块内容绑对应短句的开头（字幕序号或短句开头的原话），逐项图片窗绑各自关键词起音；预览时抽查台词刚开口的帧。同时定好每镜的「背景素材类型 + 城市 + 时段」和是否需要概念图。
4. **找视频素材（每期都要重新找）**：按 `references/素材与生图规则.md` 的 A 部分，上网找 **≥1080p 的中国城市航拍，优先白天，优先学员所在城市**。只用可免费商用的来源（Pexels、Pixabay、Mixkit、Coverr、Videvo 中标 Free 的），排除有水印、画面模糊的素材；夜景只在文案需要时才用。素材要比镜头长（不够时最多自动慢放到 0.75 倍）。下载到 `public/media/stock/`，登记到 SOURCES.md，跑 **`npm run stock:verify`**，全部 ✓ 才继续。`npm run stock` 只是演示用的兜底素材。
5. **生成概念图**：按规则 B 部分，每个关键概念或关键数字配一张，一期 3–6 张。**调用生图模型**生成，要求写实、明亮的自然光、暖中性色、中国住宅场景、**画面里没有文字、logo 和水印**。缩放压缩到 ≤300KB 的 JPG，放进 `public/media/gen/`。逐张检查有没有乱码字，有就重新生成。没有生图模型时，用免费图库照片，规则一样。
6. **改 `template/src/demo/shots.ts`**：只改数据，不改坐标，**不写秒数**（时长来自时间码）。字段说明见 `references/版式目录.md`。金色用 `{…}` 标出，每个标题最多一处。屏幕上的数字要和口播一致。白天素材的 `bg.dark` 取 0.38–0.45，夜景取 0.52–0.60（见规则 C 部分）。
7. **`npm run check`**：检查音画同步（音频存在、总帧数 = 音频 + 15 帧、镜头无空隙、每句字幕都被覆盖、锚点都找得到、素材够长）、字幕规格（字号 38–46、每行 ≤18 字），以及贴栏线、组距 ≥48、字号、填充率 ≤75%、行高 ≥1.3、溢出、城市名、素材重复。报错就改数据，**不要关掉检查**。
8. **`npm run stills`**：逐张看定格图 `out/stills/S01–S10.png` 和字幕抽查图 `out/stills/sub_XX.png`，确认主信息一眼能看到、只有一处金色、画面不挤、白字看得清、没有水印和乱码字、右侧 15% 空着、字幕只占底部字幕区。
9. **`npm run render`**：渲染带声音和字幕的成片。用 `ffprobe` 确认有 aac 音频流，再在几句字幕的时间点截图，确认画面、字幕、口播是同一句；抽查转场有没有顿帧（见「验收」）。

## 设计思路（Codex 照着这些就能复现风格）
### 1. 按内容类型选版式
| 文案在说什么 | 首选版式 | 备选 |
|---|---|---|
| 开场、提出问题 | titleFloat | — |
| 一个关键数字 | bareNumber | ringFeature（如果是比例） |
| A 和 B 对比 | splitVs | waitVs（对比的是时间或等待） |
| 流程、步骤 | timeline | mediaRows |
| 清单、注意事项 | quoteStack | mediaRows（有合适配图时） |
| 比例、占比 | ringFeature | bareNumber |
| 金句、观点 | quoteStack（引号） | titleFloat |
| 总结、三个数字 | triadSoft | — |
| 片尾总结（小滕出镜） | outroHost | — |
| 走势（逐年变化） | lineReveal（折线） | — |
| 构成、几项金额对比 | barGlow（柱状） | rankBars |
| 排名（4–5 项） | rankBars（排名条） | barGlow |
| 人群比例（每 100 人里…） | waffle（方块格） | ringFeature |
| 两方案总账（全款/贷款、租/买） | balance（天平） | splitVs |
| 年限进度（第几年还完…） | yearRing（年份进度环） | ringFeature |
| 计算过程（月供、总价） | formulaCalc（月供算式） | bareNumber |

**房产9套优先映射**：楼层→floorLadder；首付构成→paymentSplit；配套→amenityOrbit；避坑→pitfallBoard；单价面积总价→priceStep；选择→decisionFork；片区→districtTags；房贷→loanDial；条件逐项→layerReveal。字段见版式目录；不以unitCompare替代现实户型分析。

**5.0 数据版式规则**：①协调合理、不过小也不过大——内容约占版式矩形 55–75%，字号守下限（标签 ≥26、正文 ≥34），大数字 76–150px 即可，不用空荡大卡片；②每镜只一处金色主强调；③每期数据版式合计最多 3 次、同一种最多 1 次，别连着两镜都用；④所有数字必须核算（月供按等额本息 M=P·r(1+r)ⁿ/((1+r)ⁿ−1) 自己算一遍，总利息、累计利息过半年份同样逐月算），示例数据必须挂「* 数据为示例」。字段见 `references/版式目录.md`。

### 2. MG 要有变化
- 相邻两个镜头**不能**用同一种版式，主动画也不能一样（数字滚动、画线、圆环、条目焦点移动、左右对比，轮换着用）。
- 标准8–12镜一期至少7种版式，其中至少2种不同的已定房产MG；短片适配见下方轮换条款。同一种版式要重复用时，中间至少隔 2 个镜头，而且数据形态要不同（比如一个是金额、一个是面积单价）。
- 能不用卡片就不用：数字、时间轴、条目都直接放在背景上，只靠细描边和柔和阴影区分层次。不限制房产MG出现次数为2；同版式次数与轮换遵从下方已定条款，禁止满屏同构堆卡。

### 3. 密度和留白
- 全部用 12 栏网格，元素贴栏线。独立的 MG 组之间 ≥48px，左右相邻的组之间空出一整栏。
- 文字宽度不超过容器的 75%。正文和说明 ≥34px，标签、胶囊、序号、面积 ≥28px，房间名 ≥30px，标题 80px，主数字 72–150px。塞不下就换版或拆镜，不缩字号。
- 每个镜头只有 1 个主信息加 2–3 个辅助信息，文字太多就拆成两个镜头。
- 右侧 288px 留给抖音按钮，底部 180px 留给字幕，这两块区域不放东西。

### 4. 亮度
- **（5.0 调整，比 4.5 更亮，不要特别暗）** 背景提亮 `brightness(1.2) saturate(1.06)`，压暗层 = max(0.13, dark−0.26)（4.5 为 brightness 1.1、max(0.22, dark−0.16)）。渐变只留左上标题区（径向）和底部字幕区，中部通透。可读性靠标题/栏目/数据组件上的 `.txs` 柔和投影，不靠整屏压黑。
- 按素材时段调 `bg.dark`：白天航拍 0.38–0.45（5.0 实际压暗 0.13–0.19），黄昏或阴天 0.45–0.52，夜景 0.52–0.60，静图按可读性压暗；所有背景 blur=0，过曝换天空少一点的trim或换素材。
- 卡片用暖雾磨砂。色调只有香槟、暖纸、墨蓝、柔茶绿、淡陶土，一帧最多两种。亮底标题用暖描边，不用黑条。

### 5. 节奏和转场
- **画面跟着声音走**：镜头在它那句口播开始时切入，文本框、图卡和要点在对应口播刚开始时入场（锚点最多提前 2 帧起动）。镜头里没有固定的「最后 1 秒定格」，前景只在退场转场那几帧冻结，背景视频一直播放。
- 单调入场：主卡16/柔和20/小标签12帧；错开5帧；数字滚动32帧；到位后卡片停稳。
- 正片转场 softPush18 → softZoom16 → driftDissolve16 → liftReveal18，有限单调缓动，无扫光/回弹；房产子gallery为10帧柔叠化。
- 防顿帧有三条硬规则：① 视频一律用 `LiveVideo`（受 `LiveFrameCtx` 驱动）；② 每个 Sequence 设 `premountFor={30}`；③ 素材长度要够。详见规范 §9.9。

### 6. 字幕要精致，不要大
- 阿里健康体 40px（38–46），暖白字 + 柔和投影，底部默认一枚磨砂胶囊；需要清爽画面时可对单镜设 `bareSubtitles: true`，保留投影和字幕。
- 一行最多 18 字，优先单行，长句按词的时间拆成先后两条；去掉行尾标点。
- 5 帧淡入上浮；有逐词时间时，正在说的词变沙金色，不画下划线。只在底部 180px 字幕区里，不挡画面信息。

### 7. 城市中性
- 模板默认不写城市名，检查脚本会拦截。需要标城市时，只在镜头里加 `city: '某市'`，它只会显示为栏目行的前缀。
- 数字都标为「示例」，具体城市的真实数据由使用者自己填。

### 8. 片尾：小滕出镜 + 按片尾文案排版
- 默认版式 `outroHost`（`outroAir` 为同一实现的别名）。小滕卡通（`media/character/xiaoteng_outro.png`，挥手+竖拇指）默认出镜：占左侧约 1/3 宽、底边贴画面底并渐隐，脚下暖色地面光晕；从左下柔和滑入 → 轻微呼吸浮动 + 小幅摆动模拟挥手。`character:false` 关闭，文字居中。
- 右侧 5–11 栏按片尾文案分层：眉标 → 主标题（核心观点，可一处金色）→ 金线 → 要点玻璃条 `points`（≤3 条，编号 01/02/03）→ 收尾句 `note` → 小字署名 `account`（如「极限小滕 · 房产科普」）。
- 数据：`OutroData = {eyebrow?, line, points?, note?, account?, character?}`。屏幕文字只来自当期片尾文案。
- **禁止引导语**：模板不加、也会自动过滤含「点赞/关注/收藏/转发/三连/评论区/订阅」的要点/收尾句；不做按钮式 CTA。

### 9. 素材和生图（详见 `references/素材与生图规则.md`）
- 视频：每期重新找。要求 ≥1920×1080 的中国城市航拍，**优先白天、优先学员所在城市**，可免费商用，没有水印，画面清楚。时长最好 ≥ trim + 镜长 + 0.5s（不够时自动慢放，最慢 0.75 倍），每段只用一次。镜头类型（天际线、住宅小区、道路车流、江河、CBD、工地）要轮换。用 `npm run stock:verify` 校验，登记到 SOURCES.md。找不到时按规则 A6 的兜底顺序降级。
- 概念图：Codex 调用生图模型生成，一期 3–6 张。要求写实、明亮的自然光、暖中性色、中国住宅场景、没有任何文字、logo 和水印。≤300KB 的 JPG 放进 `public/media/gen/`，生成后检查有没有乱码字。
- `npm run stock` 和 stock.json 只是演示片的兜底素材，其中 4 段是 720p 夜景，正式出片不要直接用。

## 验收
- `npm run check` 全部 ✓，`npm run stills` 的定格图和字幕抽查图逐张看过。
- `ffprobe out/成片.mp4` 有 aac 音频流，时长 ≈ 音频 + 0.5 秒；抽几句字幕的时间点截图，画面和字幕对得上口播。
- 顿帧检查（可选）：`npx remotion ffmpeg -i out/成片.mp4 -vf signalstats,metadata=print:key=lavfi.signalstats.YDIF -f null -`，不能出现连续 ≥2 帧 YDIF=0。

## 目录
- `template/`：完整的 Remotion 工程（`src/style` 是风格核心，`src/demo` 是示例片，`scripts` 是跨平台脚本）
- `references/风格设计规范.md`：完整规范（网格、字号、颜色、动效、检查规则）
- `references/音画同步与字幕.md`：音频 + 时间码字幕的输入格式、镜头绑定、动效锚点、字幕设计和检查
- `references/素材与生图规则.md`：每期找视频素材和生成概念图的规则
- `template/episodes/demo/`：示例期（TTS 口播 + 校对过的字幕）
- `references/版式目录.md`、`references/组件API.md`
- `references/preview/`：预览图

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
6. 背景优先清晰视频，静图背景占比≤1/3；不整屏模糊，bg.blur=0。可读性靠暖雾卡面的深墨字，以及亮底标题的暖描边。
7. 卡片按口播锚点单调入场，16/20/12帧后精确停稳；禁止过冲、落地二次弹、邻居让位、整体呼吸/焦点缩放、僵硬扫光条。高亮只改变轻色光/文字亮度；数据绘制、进度填充、背景自然运镜与小滕人物摆手可保留，不让卡片整体晃动。

唯一登记：`src/style/layouts.ts` 的 DEFAULT_LAYOUTS（10+7+9）；默认活目录 `src/gallery/shots-mg-gallery.ts` / `MgGallery`，每个默认版式一镜。房产子集 `shots-mg-re10.ts` / `MgGalleryRe10` 固定9镜、40.5秒；“re10”仅兼容旧文件名，不代表10套。
检查：`npm run check:freeze` 验证暖雾材质、动效和 26+9 边界；`npm run check:constraints` 验证新卡几何、户型、字体实测和文案匹配；正式出片还须 `npm run check`。新卡进 `NEW_LAYOUTS`，不要塞进 `DEFAULT_LAYOUTS`。

## 怎么用新卡和文案匹配
一期口播先切句，再交给 `正片/template/src/match/matchCopy.ts` 的 `matchEpisode()`。规则在 `match_rules.json`：12 种意图，按关键词、结构、数字和位置打分，再用容量和反重复选版式。

```ts
import {matchEpisode} from './src/match/matchCopy.ts';
const picks = matchEpisode(shots, {episode: '12', title: '月供和户型', history});
// picks[i].layout 是版式名，tone 是色调，broll 是素材类别，status==='manual' 时交给人工
```

选版时记住：
- 原 26 款和房产 9 套继续用。8–12 镜至少 7 种版式，其中房产 MG 至少 2 种，新卡 2–4 款。新卡每期每种最多 1 次，原版式每种最多 2 次，相邻不能相同，同版式至少隔 2 镜。
- 塞不下（六边形固定 4 步且说明每行 ≤6 字、弯道 3–5 步、票根 ≤3 行、钉点 ≤3）就换下一个候选或拆成两镜，不要把正文字号降到 34 以下。
- 连线、引线、流程线只画在模块缝里，端点停在卡外 0–6px。户型必须用 `floorplans.ts` 的标准库或当期真实描图，标「示例」；要有墙厚、门弧、三线窗，动线只能过门。
- 片尾总结若要互动，给 `outroHost` 的 data 加 `interact:'hold'`（托着小结卡，念到哪条亮哪条）或 `interact:'talk'`（气泡 + 便签）。不要写点赞、关注、收藏、转发。
- 标题和屏幕示例不要出现「投资」「一定」「必涨」。

对照文档：`references/设计说明.md`、`references/文案匹配机制.md`、`references/排版底层约束.md`。样片合成是 Remotion 的 `MgGalleryNew`。

## 暖雾磨砂参数
唯一来源仍是 `template/src/style/tokens.ts` 的 `GLASS_V6`。卡内模糊 26px，填充香槟半透，深墨字，背景 blur 为 0。完整参数、五种色调和动效帧数见 `references/风格设计规范.md`。
