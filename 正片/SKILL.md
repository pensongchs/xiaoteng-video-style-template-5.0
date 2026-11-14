---
name: 小滕分镜风格5.0正片
description: 用 Remotion 做 1920×1080 横屏房产科普正片（5.0 新定版：玻璃 v6 暖雾磨砂 + 官方房产 MG）。正式出片只用 layouts.ts 已登记版式，走 ShotView / sceneOf，样片只看仓库 previews/v6.2 的中帧定格。禁止自造简版版式或并行渲染器。包含音画同步、烧录字幕、文案匹配、12 栏网格和自动排版检查，可在 Windows 和 Mac 上直接运行。
---

# 5.0 新定版（玻璃v6 + 房产MG）· 正片 SKILL

> 已定：2026-11-06（Asia/Shanghai）。2026-11-12 起卡片材质是暖雾磨砂 v6.1（卡内 blur 26px，香槟/暖纸填充，深墨字，背景不虚化）。2026-11-13 起圆角 36–42，异形圆角，卡内序号 / 标题 / 说明分层；中景整组约 rotateY 12°、单卡再侧约 8°，户型拆解近正视以免户型图变形；徽章压卡边，底下有接触阴影。入场 16/18/20/12 帧，到位停稳，无回弹。默认 26 种仍在，房产 9 套仍在，另有 17 款新卡进选卡池。字幕保持 main：40px、`#F4EEE4`、当前词 `#F3D79E`、距底 44px。
> 工作流和音画同步沿用；玻璃/动效/版式不得照历史成片还原旧液态风。先 `npm run check:freeze`，再按本期数据做 check / stills / render。

## 正式出片硬约束

样片只有仓库根目录 `previews/v6.2/` 的官方中帧定格：圆润暖雾磨砂、字号分层、中景侧转透视，以及已经锚更过的 MG 形状。

- `previews/v6.2/X08_六边形步骤.png`
- `previews/v6.2/X02_贷款弯道.png`
- `previews/v6.2/X01_月供水位杯.png`
- `previews/v6.2/X04_户型拆解.png`
- `previews/v6.2/X10_家庭配户型.png`
- `previews/v6.2/X05_楼栋剖面.png`
- `previews/v6.2/片尾_托房投出小结.png`
- 总览：`previews/v6.2/关键镜中帧联系表.png`

`references/preview/`（含 `联系表.jpg` 和 `S01–S10.jpg`）以及 `previews/v6/` 的联系表是历史资料。保留这些文件。不要把它们写成「这套风格的样子」，也不要拿它们当验收标准。不必为此重渲全套 26 镜。

1. 正片每一镜的 `layout` 只能是 `template/src/style/layouts.ts` 里 `LayoutName` 已登记的官方版式：默认 26 种（`DEFAULT_LAYOUTS`）加新 17 款（`NEW_LAYOUTS`）。存档 6 套仍在类型里，不默认推荐。`outroAir` 只是 `outroHost` 的别名。做某一期时不要改 `LayoutName`，也不要把新 17 款写进 `DEFAULT_LAYOUTS`。
2. 必须走官方渲染。`src/demo/Demo.tsx` 用 `ShotView`（`style/archetypes`）画每一镜；新 17 款再进 `sceneOf` 和 `mgNew.tsx` 的官方卡片。禁止为一期视频再写 `EpisodeViews` 或其他并行简版渲染器，禁止用自制深色扁面板、两行字幕或纯空镜去顶替官方 MG。官方组件里的 `glassMat('dark')` 已经接到暖雾磨砂，做本期时不要改这个函数，也不要另包一层深色板。
3. 禁止自造不在 `LayoutName` 里的版式，例如 phrase、broll、chapterTitle、wordCompare、commuteCalc，以及 opening。片头只走仓库 `片头/` 模板，不要混进正片版式池。
4. 先跑 `matchEpisode()`，镜头表写成它给出的 `layout`。某个版式塞不下，就换它的下一个官方候选，或把这句拆成两镜。已有轮换保留：8–12 镜至少 7 种版式，其中房产 MG 至少 2 种，新卡 2–4 款。同一版式原 26 款最多 2 次、新卡最多 1 次，相邻不能相同，同版式至少隔 2 镜。
5. `titleFloat` / `bareNumber` 只在匹配结果就是它们时使用。匹配已经给出 ticketStub、archLight、amenityPins、buildingSection、paymentSplit 这类设计型 MG 时，把这张官方 MG 画出来。不要改成两行大标题、章节大字或空镜。
6. 卡片工艺保持现定版：暖雾磨砂（香槟/暖纸，不是灰底或深色底），圆角 36–42，中景整组约 rotateY 12°、单卡再侧约 8°，字号分层，字不压图，连线不穿模。字幕定版不要动：暖白 `#F4EEE4`，当前词 `#F3D79E`，40px，距底 44px。标题不要写「投资」。
7. `src/demo/shots.ts`、`episodes/<期名>/shots.ts` 和文件名带「镜头表」的表，只要出现未登记的 layout 名，`npm run check` 和 `npm run check:constraints` 都会失败。两道检查都要跑，不要停掉原来的几何、字幕和音画约束。

## 快速开始
```bash
cd template
npm run setup          # 优先复用已有的 node_modules，没有才 npm install；同时下载演示素材
npm run episode -- demo  # 读取 episodes/demo/ 的音频和字幕，生成音画同步时间轴
npm run stock:verify   # 校验视频素材：≥1080p、帧率、时长、不重复、已登记
npm run check          # 静态检查加 DOM 排版检查（全部 ✓ 才继续）
npm run stills         # 输出本期 out/stills/S01….png 和 out/联系表.png（交付抽查；风格样片仍看仓库 previews/v6.2）
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
6. **改 `template/src/demo/shots.ts`**：只改数据，不改坐标，**不写秒数**（时长来自时间码）。`layout` 用 `matchEpisode()` 给出的已登记名字。画面留给 `Demo.tsx` 的 `ShotView`，不要另写渲染组件，也不要改 `GlassCard`、`tokens.ts`、字幕令牌或 17 款 MG 的实现。字段说明见 `references/版式目录.md`。金色用 `{…}` 标出，每个标题最多一处。屏幕上的数字要和口播一致。白天素材的 `bg.dark` 取 0.38–0.45，夜景取 0.52–0.60（见规则 C 部分）。
7. **`npm run check`**：检查音画同步（音频存在、总帧数 = 音频 + 15 帧、镜头无空隙、每句字幕都被覆盖、锚点都找得到、素材够长）、字幕规格（字号 38–46、每行 ≤18 字），以及贴栏线、组距 ≥48、字号、填充率 ≤75%、行高 ≥1.3、溢出、城市名、素材重复。报错就改数据，**不要关掉检查**。
8. **`npm run stills`**：逐张看本期定格图 `out/stills/S01….png` 和字幕抽查图 `out/stills/sub_XX.png`。卡片质感、侧转和 MG 形状对照 `previews/v6.2/`，不要对照 `references/preview/`。确认主信息一眼能看到、只有一处金色、画面不挤、没有水印和乱码字、右侧 15% 空着、字幕只占底部字幕区。
9. **`npm run render`**：渲染带声音和字幕的成片。用 `ffprobe` 确认有 aac 音频流，再在几句字幕的时间点截图，确认画面、字幕、口播是同一句；抽查转场有没有顿帧（见「验收」）。

## 设计思路（按官方版式填数据，不另起一套画面）
### 1. 已登记版式在讲什么
选版以 `matchEpisode()` 为准。下表只说明某个已登记版式适合哪类文案、该填哪些字段。匹配结果是设计型 MG 时，不要改成 `titleFloat` 或 `bareNumber`。

| 文案在说什么 | 对应版式 | 同意图的其他官方版式 |
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

**房产 MG 语义**：楼层→floorLadder 或 buildingSection；首付构成→paymentSplit 或 paymentCup；配套→amenityOrbit 或 amenityPins；避坑→pitfallBoard；单价面积总价→priceStep；选择→decisionFork 或 slashCompare；片区→districtTags；房贷→loanDial 或 loanCurve；条件逐项→layerReveal；户型→planSplit；家庭与户型→familyPlan；步骤→hexSteps。这些只是意图提示。`matchEpisode()` 给出哪一个，镜头表就写哪一个。不以 unitCompare 替代现实户型分析。

**5.0 数据版式规则**：①协调合理、不过小也不过大——内容约占版式矩形 55–75%，字号守下限（标签 ≥26、正文 ≥34），大数字 76–150px 即可，不用空荡大卡片；②每镜只一处金色主强调；③每期数据版式合计最多 3 次、同一种最多 1 次，别连着两镜都用；④所有数字必须核算（月供按等额本息 M=P·r(1+r)ⁿ/((1+r)ⁿ−1) 自己算一遍，总利息、累计利息过半年份同样逐月算），示例数据必须挂「* 数据为示例」。字段见 `references/版式目录.md`。

### 2. MG 要有变化
- 相邻两个镜头**不能**用同一种版式，主动画也不能一样（数字滚动、画线、圆环、条目焦点移动、左右对比，轮换着用）。
- 标准8–12镜一期至少7种版式，其中至少2种不同的已定房产MG；短片适配见下方轮换条款。同一种版式要重复用时，中间至少隔 2 个镜头，而且数据形态要不同（比如一个是金额、一个是面积单价）。
- 官方池里本来就有 `titleFloat`、`bareNumber`、`timeline` 这类字多、卡少的版式。只在 `matchEpisode()` 选中它们时使用。已经选中设计型 MG 时，按 `previews/v6.2/` 把暖雾磨砂卡片、侧转和 MG 形状画出来。同版式次数与轮换遵从下方已定条款，禁止满屏同构堆卡，也不要为了少用卡片改成两行字幕或纯空镜。

### 3. 密度和留白
- 全部用 12 栏网格，元素贴栏线。独立的 MG 组之间 ≥48px，左右相邻的组之间空出一整栏。
- 文字宽度不超过容器的 75%。正文和说明 ≥34px，标签、胶囊、序号、面积 ≥28px，房间名 ≥30px，标题 80px，主数字 72–150px。塞不下就换版或拆镜，不缩字号。
- 每个镜头只有 1 个主信息加 2–3 个辅助信息，文字太多就拆成两个镜头。
- 右侧 288px 留给抖音按钮，底部 180px 留给字幕，这两块区域不放东西。

### 4. 亮度
- **（5.0 调整，比 4.5 更亮，不要特别暗）** 背景提亮 `brightness(1.2) saturate(1.06)`，压暗层 = max(0.13, dark−0.26)（4.5 为 brightness 1.1、max(0.22, dark−0.16)）。渐变只留左上标题区（径向）和底部字幕区，中部通透。可读性靠标题/栏目/数据组件上的 `.txs` 柔和投影，不靠整屏压黑。
- 按素材时段调 `bg.dark`：白天航拍 0.38–0.45（5.0 实际压暗 0.13–0.19），黄昏或阴天 0.45–0.52，夜景 0.52–0.60，静图按可读性压暗；所有背景 blur=0，过曝换天空少一点的trim或换素材。
- 卡片用暖雾磨砂。圆角 36–42，六边形和房子等异形把角磨圆。色调只有香槟、暖纸、墨蓝、柔茶绿、淡陶土，一帧最多两种。卡内字分序号、标题、说明，短句写全，不缩成空卡里的小字。中景卡片侧转，字仍要能读。亮底标题用暖描边，不用黑条。

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
- `references/preview/`：历史预览（旧大标题轻量 MG）。验收样片是仓库 `previews/v6.2/`

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

版式登记以 `src/style/layouts.ts` 的 `LayoutName` 为准：`DEFAULT_LAYOUTS` 26 种（10+7+9）加 `NEW_LAYOUTS` 17 款。存档 6 套仍在类型里，不默认推荐。`outroAir` 只是别名。正式镜头只能用这些已登记名字，并由 `ShotView` / `sceneOf` 渲染。默认画廊仍是 `shots-mg-gallery.ts` / `MgGallery`（26 镜）；新卡样片是 `MgGalleryNew`。房产子集 `shots-mg-re10.ts` / `MgGalleryRe10` 固定 9 镜、40.5 秒；“re10”只是旧文件名。
检查：`npm run check:freeze` 验证暖雾材质、动效和 26+9 边界；`npm run check:constraints` 验证新卡几何、户型、字体实测、文案匹配，以及镜头表版式名已登记；正式出片还须 `npm run check`（含同一道登记检查）。新卡进 `NEW_LAYOUTS`，不要塞进 `DEFAULT_LAYOUTS`。视觉验收看仓库 `previews/v6.2/`。

## 怎么用新卡和文案匹配
一期口播先切句，再交给 `正片/template/src/match/matchCopy.ts` 的 `matchEpisode()`。规则在 `match_rules.json`：12 种意图，按关键词、结构、数字和位置打分，再用容量和反重复选版式。

```ts
import {matchEpisode} from './src/match/matchCopy.ts';
const picks = matchEpisode(shots, {episode: '12', title: '月供和户型', history});
// picks[i].layout 写进镜头表。broll 是背景素材类别，不是版式名。status==='manual' 时交给人工，仍只能改用另一个已登记版式。
```

选版时记住：
- `picks[i].layout` 就是这一镜的版式，原样写入 `shots.ts`。8–12 镜至少 7 种版式，其中房产 MG 至少 2 种，新卡 2–4 款。新卡每期每种最多 1 次，原版式每种最多 2 次，相邻不能相同，同版式至少隔 2 镜。
- 塞不下（六边形固定 4 步且说明每行 ≤6 字、弯道 3–5 步、票根 ≤3 行、钉点 ≤3）就换下一个官方候选或拆成两镜，不要把正文字号降到 34 以下，也不要改成 `titleFloat`、两行字幕或空镜。
- 连线、引线、流程线只画在模块缝里，端点停在卡外 0–6px。六边形和贷款弯道用圆角曲线顺着空隙走，保持高低错落，不要直线插头，也不要把线穿进半透明卡。
- 同一张卡里，标题、说明、数字、标签不能压到人偶、图标、刻度、户型图或另一块文字。字和图形之间至少留 24px。户型必须用 `floorplans.ts` 的标准库或当期真实描图，标「示例」；要有墙厚、门弧、三线窗，动线只能过门。
- 片尾总结若要互动，给 `outroHost` 的 data 加 `interact:'hold'`（托着小结卡，念到哪条亮哪条）或 `interact:'talk'`（气泡 + 便签）。不要写点赞、关注、收藏、转发。
- 标题和屏幕示例不要出现「投资」「一定」「必涨」。

对照文档：`references/文案匹配机制.md`、`references/排版底层约束.md`。`references/设计说明.md` 是更早的 HTML 预览笔记，不是本期验收。样片合成是 Remotion 的 `MgGalleryNew`，中帧定格看仓库 `previews/v6.2/`。

## 暖雾磨砂参数
唯一来源仍是 `template/src/style/tokens.ts` 的 `GLASS_V6`。卡内模糊 26px，填充香槟半透，深墨字，背景 blur 为 0。圆角、侧转和接触阴影见同一文件的 `RADIUS` 与 `DEPTH`。完整参数、五种色调和动效帧数见 `references/风格设计规范.md`。
