# 飘痕の博客 - 前端项目

由于前端技术日新月异的发展，为了与时俱进，顺应技术潮流，因此打算使用MVVM数据双向绑定的思想来实现一个全新的博客系统，用于替换我的以传统服务端渲染（Server Side Rendering，简称[SSR](https://zh.wikipedia.org/wiki/%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E6%B8%B2%E6%9F%93)）为基础的博客系统[heroku-blog](https://github.com/lzqwebsoft/heroku-blog)。

本来计划只是升级一下Bootstrap库到4.0版本，并使用Thymeleaf模板替换现有JSP前端，但发现Bootstrap 3升级到4改动太大，并且Thymeleaf模板虽然相较于直接的JSP开发便捷，但是性能不及JSP，由于我这个穷屌丝购买的服务器便宜低配，性能还是很重要的。heroku-blog一运行，服务器1G的内存直接飙到90%。而最最让我忍受不了的是即使开启了Spring Boot的热启动机制，但每一次修改Thymeleaf模板仍特别的费劲，修改显示仍然不像PHP Python等脚本语言那样即时。为了兼顾Java的稳定性，并且希望前端修改即时显示，一不做二不休，来一个前端分离，岂不快哉！

确定好前后端分离后，2019年直接开干了，但后面由于工作与生活等原因，项目搁置了很长时间，直到2025年初才重新开始，并拖拉到2025年底才基本完工。得益于AI技术Vibe Coding的发展，编写前端代码变得无比的简单与省力，我可以说我的这个项目80%-90%的代码都是AI生成的。现在我都不直接写代码了，AI写的比我漂亮，输入提示词后我只负责检查一下代码的逻辑是否有错误及简洁。

本仓库为前端，使用Vue 3构建，为单页应用程序(Single Page Application，简称[SPA](https://zh.wikipedia.org/wiki/%E5%8D%95%E9%A1%B5%E5%BA%94%E7%94%A8))。集成了文章展示、分类检索、后台管理、多种编辑器支持以及完善的用户验证流程。

项目已成功运行在：[blog.zqluo.com](https://blog.zqluo.com)

## 🚀 技术栈

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **网络请求**: [Axios](https://axios-http.com/)
- **图标库**: [FontAwesome 6](https://fontawesome.com/)
- **内容解析/渲染**:
  - [Marked](https://marked.js.org/): Markdown 解析
  - [PrismJS](https://prismjs.com/): 代码高亮渲染
- **样式**: 原生 CSS / SASS (SASS-embedded)

## ✨ 核心功能

- **首页模块**: 展示博客文章列表，支持按分类进行筛选。
- **文章详情**: 专业的阅读体验，支持代码语法高亮显示。
- **内容创作**:
  - 内置 **Markdown 编辑器** 和 **富文本编辑器 (RichTextEditor)**。
  - 支持图片插入与预览、链接编辑等功能。
- **用户系统**:
  - 博主登录验证。
  - 完善的密码管理流程：修改密码、忘记密码找回（支持 SID 验证重置）。
- **个性化设置**: 提供博客站点的全局配置界面。
- **SNS 集成**: 支持文章的社交平台分享（SNSShares 组件）。

## 📂 项目结构

```text
src/
├── api/            # API 请求封装层
├── assets/         # 静态资源（图片、全局样式等）
├── components/     # 通用 UI 组件
│   ├── AppHeader.vue      # 全局顶栏（包含导航和搜索）
│   ├── AppFooter.vue      # 全局底栏
│   ├── MarkdownEditor.vue # Markdown 编辑器
│   └── RichTextEditor.vue # 富文本编辑器
├── router/         # Vue Router 路由配置
├── stores/         # Pinia 状态管理仓库
├── utils/          # 工具函数封装
└── views/          # 页面级组件
    ├── Index.vue          # 首页 / 文章列表
    ├── Show.vue           # 文章详情页
    ├── EditArticle.vue    # 文章发布/编辑页
    ├── Login.vue          # 登录页
    └── Set.vue            # 博客设置页
```

## 🛠️ 开发环境配置

### 推荐 IDE 设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用 Vetur)。

### 项目初始化

```sh
pnpm install
```

### 本地开发运行

```sh
pnpm dev
```

### 生产环境打包

```sh
pnpm build
```

### 代码规范检查

```sh
pnpm lint
```

# 讨个赏

使用支付宝，打赏一下我吧，请我喝瓶饮料吧😁😁❤️❤️😍😍。

![二维码](https://user-images.githubusercontent.com/1137657/41339121-ad888ad8-6f26-11e8-92ab-eeba2cca8b49.jpg)
