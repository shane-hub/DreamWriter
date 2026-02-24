# 真实对接：Huobao Drama API Contract

通过摸排 `services/huobao-drama/api/routes/routes.go` 与 `handlers`、`services` 层得出的真实调用链路。
每次请求均由 `DreamWriter` 前端发送至 Next.js `/api/huobao/*`，自动代理至后端 `http://localhost:5678/api/v1/*`。

## 链路 1：从小说到分镜（Storyboard Generation Pipeline）

由于 Huobao 采取“项目(Drama) -> 章节(Episode) -> 分镜(Storyboard)”的实体结构，我们需要分步调用。

### 1.1 创建短剧项目
- **Endpoint**: `POST /api/huobao/dramas`
- **Body**:
```json
{
  "title": "短剧名称(必填)",
  "description": "小说大纲...",
  "genre": "赛博朋克",
  "style": "ghibli"
}
```
- **Response**: 返回创建的 Drama 对象，提取 `id`。

### 1.2 注入小说正文（作为章节）
- **Endpoint**: `PUT /api/huobao/dramas/:drama_id/episodes`
- **Body**:
```json
{
  "episodes": [
    {
      "episode_num": 1,
      "title": "第一集",
      "script_content": "这里是用户粘贴的小说正文..."
    }
  ]
}
```

### 1.3 触发大模型提取分镜
- **Endpoint**: `POST /api/huobao/episodes/:episode_id/storyboards`
- **Body**: (可选)
```json
{
  "model": "gpt-4o"  // 透传使用的模型名称
}
```
- **Response**: 这是一个异步任务，返回任务ID：
```json
{
  "code": 0,
  "data": {
    "task_id": "uuid-xxx-yyy",
    "status": "pending"
  }
}
```

### 1.4 轮询分镜提取进度
- **Endpoint**: `GET /api/huobao/tasks/:task_id`

---

## 链路 2：一键最终合成视频（Video Finalize Pipeline）

### 2.1 触发生成与合成
- **Endpoint**: `POST /api/huobao/episodes/:episode_id/finalize`
- **说明**: 该接口封装了：批量生图、批量配音、FFmpeg 合成的端到端全自动流程。触发后同样为异步。

### 2.2 查询最终短剧视频
- **Endpoint**: `GET /api/huobao/episodes/:episode_id/download`
- **Response**:
```json
{
  "video_url": "http://localhost:5678/static/video_xxxx.mp4"
}
```

**以上就是 Huobao 真实可用、无界面调用的硬核 API 契约协议。**
