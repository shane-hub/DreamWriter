<h1 align="center">DreamWriter (织梦)</h1>

<p align="center">
  <strong>🔥 你的私人 AI 爆款网文生成神器 | 极简与硬核双模式 | 纯前端本地存储，隐私至上 🔥</strong>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  <img alt="Framework" src="https://img.shields.io/badge/Framework-Next.js-black?logo=next.js" />
  <img alt="Data" src="https://img.shields.io/badge/Data-LocalFirst-success" />
</p>

## ✨ 什么是 DreamWriter
**DreamWriter** 是一款开源的 AI 网文小说写作辅助工具。完全基于 Web 浏览器运行，支持接入全网主流的大语言模型 (DeepSeek, ChatGPT, Claude, Kimi 等)。无论你是一个只有模糊好点子的“网文小白”，还是有着庞大世界观设定、精确掌控每一章剧情的“资深作者”，DreamWriter 都能极大提升你的内容产出效率！

## 🚀 核心特性

- 🎯 **双模式驱动，丰俭由人**
  - **极简模式**：只想看爽文？输入一句话主题（如：“赛博朋克+诡秘复苏+苟道流”），AI 为你一键包揽大纲生成到正文的连载。
  - **硬核模式**：真正的生产力工具。提供交互式工作流，允许你打磨**世界观设定**、**人物属性卡**与**章节剧情树**，每一步都让你拥有绝对的掌控权。
- 🔑 **自带 Key 模式 (BYOK) & 纯本地大模型支持**
  - 系统核心不收你一分钱。你可以填入自己申请的任何兼容 OpenAI 格式的 API Key (如 DeepSeek, Kimi)。
  - **100% 支持本地离线模型**：只要你本地运行着 Ollama、LM Studio 等服务，直接在设置中选择“自定义模型”并填入本地 API 地址（如 `http://localhost:11434/v1`），即可实现断网、零成本创作。
- 🛡️ **前后端全栈架构 & 隐私至上**
  - DreamWriter 采用 Next.js + Python FastAPI 全栈架构。所有的设定、草稿、API 密钥均安全可控，数据通过 SQLite 自动持久化存在本地，即便离线上网，你的心血和灵感也绝对安全。
- 🎨 **极致沉浸的创作体验**
  - 极具现代感的暗黑模式 UI 界面，玻璃拟物化设计和流畅微动画，让码字也成为一种视觉享受。
- 📤 **多格式一键导出**
  - 随时将已生成的小说章节导出为 Markdown 或精排版 TXT 文件。

## 🛠️ 快速开始

本项目基于 [Next.js](https://nextjs.org/) 开发，采用 React + TailwindCSS(或自定义现代CSS体系) 构建。

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/DreamWriter.git
cd DreamWriter
```

### 2. 安装依赖
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. 本地启动
```bash
npm run dev
```

在浏览器打开 [http://localhost:3000](http://localhost:3000) 即可开始你的网文创作之旅。

## 🤝 贡献说明
随时欢迎各位开发者提交 Issue 或 Pull Request！我们可以一起来：
- 增加更多的预设网文提示词（Prompt）流派模版
- 优化长文本生成的上下文压缩算法与 Token 管理

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
