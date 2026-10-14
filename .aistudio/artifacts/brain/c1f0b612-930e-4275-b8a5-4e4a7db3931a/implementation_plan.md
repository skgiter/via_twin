# Via 极简浏览器：真正手机原生浏览与全功能架构方案

为解决当前应用存在的“网页渲染似电脑端/定制假主题”、“导航栏过度占用屏幕视距”以及“部分功能停留在演示原型”的问题，本方案旨在将整个应用深度重构为**任意安卓手机浏览器皆具备的标准、真实、全功能移动浏览器**。

---

> [!IMPORTANT]
> ### 关键决策确认（基于用户答复）
> 1. **原网纯净渲染**：彻底删除所有定制化伪主题（包括假 B 站卡片流），所有外部网站一律加载真实原网移动端（以 Android Mobile UA 优先，支持一键切换电脑版 UA）。
> 2. **上下导航条滚动联动**：页面向下滑动浏览时，顶部地址栏与底部操作栏平滑收起滑出视口；向上轻微滑动或触顶时，瞬间无缝滑回。
> 3. **四大功能去原型化**：
>    - **真实多标签页系统**：支持网格卡片缩略图、多页面独立历史栈、新建与滑动关闭。
>    - **智能地址栏与真实即时联想**：输入关键词实时提供搜索引擎建议词下拉联想，支持直接搜索与合法 URL 直达。
>    - **完整书签与历史管理器**：支持增删改查、文件夹分类、书签 HTML/JSON 导入导出备份。
>    - **去除所有伪造假页面**：清理所有静态架构说明文章、死链接以及外链跳转按键，实现纯正浏览器内核交互。

---

## 1. 核心概述与产品目标

- **核心定位**：极简、超快、轻量，同时具备工业级真实移动端 Web 浏览体验与底层平行隔离安全能力的 Android 浏览器。
- **目标场景**：
  - 日常无干扰、无信息流推送、无冗余广告绑架的高速网页浏览；
  - 秘密空间下双轨独立的数据隔离（书签/历史/Cookie物理独立，息屏0帧防窥锁退）。

---

## 2. 交互体验与视觉设计（UX & Visual Design）

### 2.1 动态视口与沉浸式上下栏隐藏机制 (Auto-Hide Navigation)
- **视口最大化**：
  - **默认态**：顶部单行极简 Omnibox 栏（高 48px），底部五键极简工具栏（高 48px），中间内容占满剩余空间。
  - **向下滚动（Scroll Down）**：
    - 顶部地址栏通过 `transform: translateY(-100%)` 顺滑滑出屏幕外；
    - 底部工具栏通过 `transform: translateY(100%)` 顺滑下沉隐藏；
    - 屏幕有效阅读面积瞬间提升至 **100% 纯净全屏**。
  - **向上微卷（Scroll Up）或触碰顶部**：
    - 上下两栏通过 CSS Spring 阻尼在 180ms 内同步滑入，无需打断正常浏览手势。

### 2.2 真实网页渲染与 User-Agent 切换
- **移动端真实渲染优先**：
  - 默认采用移动端标准 User-Agent：`Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36`。
  - 访问 `m.bilibili.com`、`www.baidu.com`、`zhihu.com` 时加载官方移动端完整交互（支持官方真实播放器、手势播放、弹幕、全屏旋转与点赞互动）。
- **电脑版（Desktop Mode）无缝切换**：
  - 菜单中开启“电脑模式”时，动态切换 UA 为桌面版 Chrome，自适应宽屏排版。

### 2.3 真实多标签管理器（Multi-Tab Deck）
- 借鉴经典移动浏览器卡片切换堆栈（2列网格或卡片式卡流），每个标签展示真实网页标题、favicon 图标、实时页面快照/主题色及独立关闭按钮（`×`），支持底部一键“新建标签页”与“关闭全部”。

### 2.4 智能地址栏与联想推荐（Omnibox Suggestions）
- 地址栏获取焦点时，提供基于当前搜索引擎（百度、必应、Google、DuckDuckGo）的即时搜索联想与历史快捷匹配，回车即可直接搜索或前往。

### 2.5 真实书签与历史管理体系
- **书签**：支持添加自定义标题与网址、编辑、删除、长按排序，并支持标准的浏览器书签文件（Netscape Bookmark HTML / JSON）本地导出与导入。
- **历史记录**：按天分组、支持关键词搜索、单条滑动清除与一键清空全部历史。

---

## 3. 技术架构与系统流向

```
┌──────────────────────────────────────────────────────────────┐
│                    Via Browser Shell                         │
├──────────────────────────────────────────────────────────────┤
│  Top Omnibox Bar [ translateY(-100%) on scroll down ]       │
│  ├── SSL Lock & Engine Icon                                  │
│  ├── Smart Input (Real-time Suggestions & URL parsing)       │
│  └── Refresh / Stop / Mode Indicator                         │
├──────────────────────────────────────────────────────────────┤
│  Dynamic Viewport & Web Renderer Engine                      │
│  ├── [Native Android App]: Android System WebView            │
│  │   ├── Real Mobile UA & Hardware Video Acceleration        │
│  │   ├── Top-level document (Zero X-Frame / CORS blocking)   │
│  │   └── Native Scroll Listener -> Toggle System Bars       │
│  └── [Web Preview Sandbox]: Fallback Real Frame + Full Proxy  │
├──────────────────────────────────────────────────────────────┤
│  Bottom Navigation Bar [ translateY(100%) on scroll down ]   │
│  ├── Back (◀) [History Stack Aware]                          │
│  ├── Forward (▶)                                             │
│  ├── Home (🏠) [via://home]                                   │
│  ├── Tab Switcher ([N]) [Live Grid Previews & Management]    │
│  └── Menu (···) [Bookmarks, Desktop UA Toggle, Settings]     │
├──────────────────────────────────────────────────────────────┤
│  Isolated Space Partition Engine (Encrypted Storage Vault)   │
│  └── 3-Click About Trigger + PIN Auth + 0-Frame Auto Exit    │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 关键实施步骤与交付规划

1. **第 1 步：清理伪造原型与定制主题**
   - 彻底删除 `BilibiliRenderer.tsx` 及内部一切假卡片与假视频数据；
   - 移除 `WebRenderer.tsx` 中所有的 mock 拦截逻辑，统一使用顶级直连渲染通道；
   - 移除所有多余的外链直达按键与说明文字。

2. **第 2 步：实现上下导航栏平滑滑动自动隐藏（Scroll-driven Auto-Hide）**
   - 无论在 Web 端还是 Android 原生 `MainActivity` 的 WebView 容器中，绑定统一的滚动手势差值检测（Scroll Delta）；
   - 下滑时自动为顶部栏与底栏增加隐藏动画；上滑时即刻唤醒展示；
   - 点击屏幕任意网页非交互区域也可一键呼出控制条。

3. **第 3 步：重构多标签页管理系统（Real Multi-Tabs）**
   - 实现每个标签独立维护 URL、历史堆栈（Back/Forward）、标题、favicon 及隔离状态；
   - 标签管理器弹窗升级为标准移动端双列网格预览视图，支持快速新增、切换与单独关闭。

4. **第 4 步：完善地址栏联想与全功能书签/历史管理**
   - 接入常用关键词联想下拉菜单；
   - 补齐书签与历史的编辑、检索与导入导出能力。

5. **第 5 步：原生 Android（Kotlin）打包与版本同步**
   - 将最新前端构建嵌入 `android/app/src/main/assets/www`；
   - 优化 `MainActivity.kt` 中的 WebView 手势与全屏状态栏沉浸；
   - 重新通过 GitHub Actions 编译生成正式 APK（v1.0.4）并提供一键下载。
