# onlinegames.md

## 开发任务说明：/onlinegames 广告落地页

你是一名资深前端工程师。  
技术栈：React + Next.js（App Router）+ Tailwind CSS。  

本任务是为现有项目实现一个正式页面 `/onlinegames`，使用真实游戏数据，不再使用演示数据。  
页面用于广告落地页，展示游戏 Logo 网格，并支持通过 URL 参数自定义排序。

核心需求分为三部分：

1. 网格 UI 与交互（布局、Hover、点击行为）  
2. 使用真实数据的默认排序  
3. 通过 URL 参数 `game`、`variant` 自定义排序（包括默认列表和专题列表）

--------------------------------------------------
1. 数据来源与类型
--------------------------------------------------

假设项目中已有全量游戏数据（例如从 `games.json` 导入），每条数据结构为：

type Game = {
  slug: string;
  title: string;
  thumbnail_url: string; // 一张接近正方形的游戏缩略图
};

要求：

- `/onlinegames` 页面必须使用真实 Game 数据（不要再生成 mock 数据）。
- 你可以封装一个工具函数，用「slug 顺序数组」从全量 Game[] 中筛选出对应的 Game[]。

--------------------------------------------------
2. 页面路径与点击逻辑
--------------------------------------------------

页面路径固定：

- `/onlinegames`

点击逻辑：

- 页面展示一组游戏 Logo 卡片；
- 用户点击任意一张 Logo 卡片时：
  - 跳转到 `/game/[slug]` 对应的游戏详情页；
  - 例如，slug 是 `subway-surfers`，则跳转 `/game/subway-surfers`。

请使用 Next.js App Router 的 `<Link>` 来实现：

- `<Link href={`/game/${game.slug}`}>...</Link>`

--------------------------------------------------
3. 网格 UI 设计（与既有 Landing Grid 一致）
--------------------------------------------------

整体视觉：

- 背景色：`#0b0b0e`
- 文字颜色：白色
- 外层容器：

  - `bg-[#0b0b0e] text-white min-h-screen`
  - `max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6`

### 3.1 网格列数

使用 CSS Grid + Tailwind：

- 移动端（< 768px）：3 列
- 平板（>= 768px）：4 列
- 桌面端（>= 1024px）：8 列

参考类名：

- `grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4`

### 3.2 第一个卡片为 2×2 大卡

- 只有**第一个卡片**是「2 列 × 2 行」的大卡片；
- 在所有断点（手机 / 平板 / PC）都保持 2×2 的网格占位；
- 通过在 grid item 上添加：

  - `col-span-2 row-span-2`

来实现。

### 3.3 其他卡片为严格正方形

- 除第一个大卡之外，其余所有卡片必须是严格正方形（宽高相同），禁止出现矩形。
- 不要使用 `aspect-square` 搭配 `row-span`。
- 建议使用「padding-bottom: 100% + absolute 图片」的方式：

  - 外层图片容器：
    - `relative w-full pb-[100%] bg-[#1a1b23]`
  - 图片：
    - `absolute inset-0 w-full h-full object-cover`

对于第一个大卡片：

- 外层 grid item：`col-span-2 row-span-2`
- 内部图片容器依然使用 `pb-[100%]`，这样得到的是一个更大的正方形（2×2 单元大小）。

### 3.4 Hover 动画与标题条

1）图片 Hover 放大（卡片尺寸不变）：

- 卡片尺寸固定；
- 悬浮时仅图片略微放大，避免布局跳动；
- Tailwind 组合示例：
  - 卡片根元素添加 `group`
  - 图片添加：
    - `transition-transform duration-200 ease-out group-hover:scale-110`

2）标题覆盖层：

- 显示游戏名；
- 底部黑色渐变背景；
- 移动端：默认一直可见；
- 桌面端（md 及以上）：仅 hover 时显示。

Tailwind 类建议：

- `absolute inset-x-0 bottom-0`
- `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
- `px-2 sm:px-3 pb-2 pt-4`
- `text-[11px] sm:text-xs font-semibold tracking-tight text-white`
- `opacity-100 md:opacity-0 md:group-hover:opacity-100`
- `transition-opacity duration-200`

--------------------------------------------------
4. 默认列表 & 专题列表（排序模板）
--------------------------------------------------

我们需要支持：

1）一个“默认列表” —— `/onlinegames` 不带参数时使用；  
2）多个“专题列表”（variant 列表），例如：
   - sprunki 列表（前排是 sprunki 相关游戏）
   - roblox 列表（前排是 roblox 相关游戏）
   - 其他主题列表……

### 4.1 默认列表（onlinegames 默认排序）

- 默认列表是 `/onlinegames` 在 **不带任何参数** 时，展示的游戏顺序；
- 你可以在一个配置文件中定义一个按 slug 排序的数组，例如：

  - `ONLINEGAMES_DEFAULT: string[]`

- 渲染时：
  - 根据 `ONLINEGAMES_DEFAULT` 从全量 Game[] 中提取对应条目（按顺序）；
  - 忽略在全量数据中不存在的 slug。

### 4.2 专题列表（可选）

- 允许定义多个“专题列表”，用来替换默认排序；
- 每个专题列表也是一组 slug 顺序数组，例如：

  - `ONLINEGAMES_VARIANTS: Record<string, string[]>`

    例如：

    - `ONLINEGAMES_VARIANTS["sprunki"] = ["slug1", "slug2", ...]`
    - `ONLINEGAMES_VARIANTS["roblox"] = ["slugA", "slugB", ...]`

- 这些列表默认不单独显示页面，只在通过 URL 参数 `variant` 调用时使用。

--------------------------------------------------
5. URL 参数方案 A：game + variant
--------------------------------------------------

本页面通过两个查询参数控制排序：

- `game`：目标游戏 slug（直接是 slug，本身不需要映射）
- `variant`：可选，用于选择某个专题列表作为排序模板

### 5.1 基本访问形式

1）默认访问（无参数）：

- `/onlinegames`
  - 基础顺序：使用 `ONLINEGAMES_DEFAULT`
  - 不顶置任何游戏

2）指定目标游戏（但不切换列表）：

- `/onlinegames?game=some-slug`
  - 基础顺序：使用 `ONLINEGAMES_DEFAULT`
  - 再把 `some-slug` 顶到第一位（如果不存在则尝试插入头部）

3）指定专题列表（不指定目标游戏）：

- `/onlinegames?variant=roblox`
  - 基础顺序：使用 `ONLINEGAMES_VARIANTS["roblox"]`
  - 不顶置任何游戏

4）指定目标游戏 + 专题列表：

- `/onlinegames?game=some-slug&variant=roblox`
  - 基础顺序：使用 `ONLINEGAMES_VARIANTS["roblox"]`
  - 再把 `some-slug` 顶到第一位（如果不存在则尝试插入头部）

### 5.2 排序算法（伪代码）

你可以实现一个帮助函数，例如：

- `getOnlineGamesForRequest(allGames: Game[], defaultSlugs: string[], variants: Record<string, string[]>, searchParams: { game?: string; variant?: string }): Game[]`

逻辑示例（伪代码）：

1）构建 `slug -> Game` 的 Map，方便 O(1) 查找。

2）确定基础顺序（baseSlugs）：

- 如果存在 `variant` 且 `variants[variant]` 存在：
  - `baseSlugs = variants[variant]`
- 否则：
  - `baseSlugs = defaultSlugs`

3）根据 `baseSlugs` 生成一个初始数组（过滤掉不存在于 allGames 中的 slug）：

- `orderedSlugs = baseSlugs.filter(slug => slug 在 allGames 中存在)`

4）处理 `game` 参数（目标 slug 顶置）：

- 如果存在 `game` 参数 `targetSlug` 且该 slug 在 allGames 中存在：

  - 如果 `targetSlug` 不在 `orderedSlugs` 中：
    - 将 `targetSlug` 插入到数组头部：

      - `orderedSlugs = [targetSlug, ...orderedSlugs]`

  - 如果 `targetSlug` 已经在 `orderedSlugs` 中：
    - 将其移动到数组第一位，保持其他元素顺序不变。

- 如果没有 `game` 参数：不做顶置。

5）可选：将所有不在 `orderedSlugs` 中的其他游戏，按某种规则追加到末尾（例如默认列表或全量数据）。

6）最终：根据 `orderedSlugs` 映射回 Game[]：

- `gamesForPage = orderedSlugs.map(slug => map.get(slug)).过滤掉 undefined`

并把 `gamesForPage` 传给网格组件进行渲染。

--------------------------------------------------
6. 组件与页面结构建议
--------------------------------------------------

建议代码组织方式（名称可以微调，但语义应清晰）：

1）配置文件

- 例如：`lib/onlinegames.config.ts`

  - 导出：
    - `ONLINEGAMES_DEFAULT: string[]`
    - `ONLINEGAMES_VARIANTS: Record<string, string[]>`（可为空对象）
    - 将来我会在这里填入真正的 slug 顺序。

2）排序工具函数

- 例如：`lib/onlinegames.sort.ts`

  - 实现 `getOnlineGamesForRequest(...)`，将全量 Game[] + 配置 + searchParams 转换为最终 `Game[]` 顺序。

3）页面组件 `/onlinegames`

- 文件：`app/onlinegames/page.tsx`
- 使用 App Router 的 `Page` 组件签名：
  - 接收 `searchParams`（包含 game、variant）
- 步骤：
  1. 从真实数据源获取全量 Game[]（例如从 `games.json` 导入或某个 data 模块）。
  2. 调用 `getOnlineGamesForRequest(allGames, ONLINEGAMES_DEFAULT, ONLINEGAMES_VARIANTS, searchParams)` 得到 `gamesForPage`。
  3. 使用一个网格组件（可以叫 `OnlineGamesGrid` 或复用之前的 `AdsLandingGrid`）渲染：
     - 网格列数、2×2 大卡、正方形卡片、hover 动画、标题条，都按第 3 部分的规范实现。
  4. 点击卡片使用 `<Link href={`/game/${game.slug}`}>` 跳转到详情页。

--------------------------------------------------
7. 特别注意事项
--------------------------------------------------

1. 本页面不再使用演示数据，必须接真实 Game 数据。
2. 网格行为必须满足：
   - 第一项为 2×2 大卡（col-span-2 row-span-2）；
   - 其他项为严格正方形（pb-[100%] + absolute + object-cover）。
3. Hover 时仅图片放大，卡片尺寸不变；  
   标题条移动端常显，桌面端 hover 显示。
4. URL 参数方案 A：
   - `game` 参数直接对应某个游戏的 slug；
   - `variant` 参数对应某个专题列表 key；
   - 默认列表（onlinegames 默认排序）也必须支持 `game` 参数进行顶置。
5. 无参数 `/onlinegames` 时：使用默认列表，不做顶置。

请严格根据以上说明实现 `/onlinegames` 页面及相关工具模块。
