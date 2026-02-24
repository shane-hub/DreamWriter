<h1 align="center">DreamWriter (织梦)</h1>

<p align="center">
  <strong>🔥 你的私人 AI 爆款网文生成神器 & 短剧视频合成引擎 🎬</strong>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  <img alt="Framework" src="https://img.shields.io/badge/Framework-Next.js-black?logo=next.js" />
  <img alt="Data" src="https://img.shields.io/badge/Data-LocalFirst-success" />
  <img alt="Feature" src="https://img.shields.io/badge/Feature-Video_Studio-purple" />
</p>

## ✨ 什么是 DreamWriter
**DreamWriter** 是一款开源的 AI 网文小说写作辅助与**一键短剧生成引擎**。
无论你是一个只想看爽文的“网文小白”，还是想跨界做短剧但苦于没有视频能力的“资深作者”，DreamWriter 都能极大提升你的内容产出效率！借助全新的 **Video Studio** 和底层的 **Huobao Drama Backend**，你现在可以直接将你写出的小说提取分镜，一键生成配音+微动效的 MP4 短剧视频！

## 🚀 核心特性

- 🎯 **双模式网文驱动，丰俭由人**
  - **极简模式**：只想看爽文？输入一句话主题，AI 为你一键包揽大纲生成到正文的连载。
  - **硬核模式**：真正的生产力工具。交互式打磨世界观设定、人物属性卡与章节剧情树。
- 🎬 **【New!】视频工作台 (Video Studio)**
  - 自动将小说正文解析为带有画面 Prompt 和台词 Dialogue 的结构化分镜脚本。
  - **一键合成最终视频**：无缝对接底层的 Huobao 引擎，全自动完成生图、配音、FFmpeg 合成，直接在前端出片。
- 🔑 **自带 Key 模式 (BYOK)**
  - 你可以填入自己申请的任何兼容 OpenAI 格式的 API Key (如 Gemini 1.5 Pro, DeepSeek, Kimi)。
  - **支持本地大模型**：配置本地如 `http://localhost:11434/v1` 等端点即可实现零网络成本创作。
- 🛡️ **微服务全栈架构**
  - Next.js (前端及小说资产管理) + Go/Python (Huobao 多模态生成服务)。数据通过 SQLite 分级自动持久化存在本地。
- 🎨 **极致沉浸的创作体验与导出**
  - 支持暗黑/亮色主题切换。支持随时将小说导出为 Markdown/TXT。

## 🛠️ 快速部署与开始

由于集成了强大的本地视频合成能力，推荐使用 Docker Compose 进行一键部署启动。

### 1. 克隆项目 (注意拉取子模块)
```bash
git clone --recursive https://github.com/shane-hub/DreamWriter.git
cd DreamWriter
```

### 2. Docker 一键启动 (推荐)
```bash
docker-compose up -d --build
```
*这会自动拉起 Frontend (Next.js), Backend (Go/Python 合成引擎) 以及相关数据库资源。*

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可！

### (可选) 纯前端网文模式本地开发
如果你只想二次开发 Next.js 前端的网文部分模块：
```bash
npm install
npm run dev
```

## 🤝 贡献说明
随时欢迎各位开发者提交 Issue 或 Pull Request！我们可以一起来：
- 增加前端视频时间轴编辑器功能
- 接入更多优秀的开源声音克隆库 (TTS) 和 图生视频库
- 优化长文本生成的上下文压缩算法与 Token 管理

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
