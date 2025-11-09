# KPOP Games Go — Codex 最终任务文档 (TXT)

本文件整合两部分内容：
1) Codex 最终任务指令（Next.js + Tailwind 实现方案）
2) /play/[slug] 页面最终规格（含布局与指令）

将本文件完整上传给 Codex 即可。

============================================================
【第一部分】Codex 最终任务指令（Next.js + Tailwind 实现方案）
============================================================

GOAL
----
实现：
1. 数据规范化脚本，读取 /data/game.json 并输出 /data/games.normalized.json。
2. 两个页面：
   - 游戏详情页 /game/[slug]：展示 description、how_to_play、editors_review（500–600 字），含“Play Now”跳转 /play/[slug]，右侧推荐 20。
   - 玩游戏页 /play/[slug]：标题 + 评分 + iframe + 简介 + 推荐。
3. 推荐逻辑（HotPool：按 play_count 和 created_at；同分类优先）。
4. 基础 SEO、JSON-LD、sitemap。
5. 使用 Tailwind CSS，不写独立 CSS 文件。

站点名：KPOP Games Go
主域名与 canonical：https://kpopgamesgo.com

数据规范化要求
-------------
- 字段命名统一为 snake_case。
- category 改为数组并进行映射归一化。
- 保留 v1.2.1 字段：play_count, created_at, updated_at。
- 新增渲染字段：
  * rating_value：基于 slug 哈希生成稳定随机数 [4.0–5.0]（一位小数）。
  * content_rating："Everyone 3+"。

字段结构（目标）
---------------
id: number
title: string
slug: string
thumbnail_url: string
category: string[]
description: string
how_to_play: string
editors_review: string
file_url: string
play_count: number
created_at: ISO string
updated_at: ISO string
rating_value: number  // 4.0–5.0
content_rating: string // "Everyone 3+"

分类映射规则（示例）
-------------------
- 拼写修正/同义合并：
  ACTION GMAES -> ACTION GAMES
  HIDDEN OBJECT(S) -> HIDDEN OBJECT GAMES
  ROBOT(S) -> ROBOT GAMES
  GAMES FOR GIRLS -> GIRLS GAMES
  GAMES FOR BOYS -> BOYS GAMES
  CAR RACING GAMES -> RACING GAMES
  OLYMPICS GAMES -> OLYMPIC GAMES
- 过滤渠道/技术标签：HTML5、APP STORE、MOBILE、NEW、POPULAR 等。
- 若不以 "GAMES" 结尾则补齐：如 PUZZLE -> PUZZLE GAMES。

页面结构
--------
/game/[slug]
- Header：标题 + rating_value + content_rating + Play Now。
- 正文三段：Description（100–150）/ How to Play（150–200）/ Editor’s Review（200–250）。
- 右侧推荐：HotPool 取 20（同类至少 5 + 全站补足）。

/play/[slug]
- 顶部：标题 + 评分 + Play Now（注意此页实际不再显示按钮，仅在说明保留；见第二部分）。
- 中部：iframe（file_url）。
- 下方：描述 + How to Play。
- 底部：推荐 20。
- iframe 属性示例：
  allowFullScreen
  allow="fullscreen; gamepad; autoplay; encrypted-media; clipboard-read; clipboard-write; screen-wake-lock; xr-spatial-tracking"
  sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"

推荐逻辑 HotPool
----------------
1) 按 play_count Top N(200) ∪ 按 created_at 最新 N(200) 合并去重。
2) 同分类抽取至少 5 条随机；全站热门补齐到 20；去重排除当前 slug。

SEO 规范
--------
- <title>: ${game.title} | KPOP Games Go
- <meta name="description">: 取 description（≤160 字）
- canonical: https://kpopgamesgo.com/game/${slug}
- JSON-LD (VideoGame) 字段：name/url/image/contentRating/aggregateRating 等。

sitemap
-------
- 覆盖：/ 、/game/[slug]、/play/[slug]
- lastmod 使用 updated_at。

需创建/更新的文件
----------------
scripts/normalize-games.ts
types.ts
lib/data.ts
lib/reco.ts
components/GameTile.tsx
components/Recommended.tsx
app/game/[slug]/page.tsx
app/play/[slug]/page.tsx
app/sitemap.ts

实施顺序
--------
1) 运行 normalize 脚本生成 games.normalized.json
2) 实现推荐与数据访问
3) 实现 /game 与 /play 页面
4) 添加 SEO 与 sitemap

备注
----
- content_rating 固定 "Everyone 3+"；rating_value 为基于 slug 的稳定随机。
- 当前 R2 未经 Workers；后续可加统一响应头与 CSP。
- 第三方 iframe 未来再加白名单。

============================================================
【第二部分】/play/[slug] 页面最终规格
============================================================

功能与交互
----------
- 进入 /play/[slug] 立即在 iframe 加载游戏；此页面不再显示 Play Now 按钮。
- 可选：右上角悬浮全屏按钮（后期接 Fullscreen API）。
- 若 iframe 被禁止嵌入，显示 "Open in new tab" 降级按钮，打开 file_url。

布局
----
- 桌面（≥1280px）：三栏
  左广告(300px) | 中心内容(max 1100px) | 右广告(300px)
- 平板（≥768 <1280）：隐藏左侧广告，右侧可保留。
- 移动（<768）：只显示中心内容，广告位下沉到 iframe 下方。

样式规范
--------
- 背景：#0b0b0e；面板：#111217；边框：#2a2c33；圆角：16px
- Tailwind 实现，无独立 CSS。

iframe 属性
-----------
allowfullscreen
allow="fullscreen; gamepad; autoplay; encrypted-media; clipboard-read; clipboard-write; screen-wake-lock; xr-spatial-tracking"
sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"

模块顺序
--------
1) 标题 + 评分 + content_rating
2) iframe 游戏区（立即加载）
3) 描述 + How to Play（可选）
4) 推荐游戏（20）

广告位
------
- 桌面：.ad-left（左栏） / .ad-right（右栏）
- 移动：.ad-mobile（iframe 下方）

© 2025 KPOP Games Go | Codex Task & /play Specification
