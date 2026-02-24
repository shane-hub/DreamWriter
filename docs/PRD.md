# Product Requirements Document (PRD)

## 1. 产品概述
**项目名称**：DreamWriter 短剧引擎化 (Huobao Drama Integration)
**目前背景**：DreamWriter 原本是一款纯文字产出的网文辅助写作工具。现需介入开源短剧生成服务 `huobao-drama`，使其具备完整的“剧本 -> 分镜 -> 图片 -> 配音视频”的端到端大模型生成能力。
**最终愿景**：一站式 AI 文学到影视的转化工作台。

## 2. 目标用户与痛点
- **目标用户**：网文作者、短剧制作人、自媒体创作者。
- **痛点**：
  - 传统短剧从剧本到成片链路极长，成本高昂。
  - 需要在不同的 AI 工具（ChatGPT 写剧本、Midjourney 画图、Runway 做视频、剪映配音）之间频繁倒腾数据。

## 3. 功能需求范围 (Functional Requirements)

### 3.1 核心大模型路由
- 用户能在全局设置中配置 `Gemini 1.5 Pro`, `GPT-4o`, `Claude 3.5 Sonnet` 等最新模型。
- DreamWriter 的每一次视频生成请求，都会携带此设定的模型 Key 透传给底层的 Huobao 引擎。

### 3.2 短剧工作台 (Video Studio UI)
在 DreamWriter 的侧边栏/主页提供入口进入 `Video Studio`，包含三大核心页面：
1. **剧本与分镜 (Storyboard Panel)**：
   - 输入小说原文（或大纲）。
   - 调用 AI 提取结构化数据：出场角色表、大纲结构、分镜脚本（画面 Prompt + 台词配音 Dialogue）。
   - 允许用户对生成的每一列（角色概念图、每一帧台词）进行手动修改或覆盖重绘。
2. **资产库 (Assets Library)**：
   - 集中展示本小说生成的所有图文素材。
3. **合成管线 (Video Pipeline)**：
   - 一键合成：后端将按照分镜循序提交生图、配音任务。最后通过 FFmpeg 进行组装拼接。
   - 展示合成的实时进度条。

### 3.3 非功能性需求
- **部署模式**：所有链路必须能在本地通过 `docker-compose` 一键拉起，无需复杂的云端环境。
- **UI 一致性**：新的短剧界面必须严格适配 DreamWriter 原有的 `玻璃拟物化 + 极简暗黑风`。

---
*Created by PM (Auto-Collaboration Pipeline Stage 1)*
