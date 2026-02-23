// src/lib/services/NovelService.ts
export class NovelService {
  private static getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  static async generateAndSaveOutline(
    id: string,
    topic: string,
    genre: string,
    description: string,
    llmConfig: { apiKey: string; modelUrl: string; modelName: string }
  ) {
    const novel_req = {
      id,
      title: topic,
      description,
      genre,
      outline: "大纲由极简模式生成中..."
    };

    const res = await fetch(`${this.getApiUrl()}/api/novels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novel_req)
    });

    if (!res.ok) throw new Error('Failed to create novel in backend');
    return await res.json();
  }

  static async generateChapterStream(
    chapterId: string,
    novelId: string,
    chapterTitle: string,
    guidance: string,
    llmConfig: { apiKey: string; modelUrl: string; modelName: string },
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ) {
    const res = await fetch(`${this.getApiUrl()}/api/generate/chapter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmConfig.apiKey}`
      },
      body: JSON.stringify({
        novel_id: novelId,
        chapter_id: chapterId,
        chapter_title: chapterTitle,
        guidance: guidance,
        model_name: llmConfig.modelName,
        base_url: llmConfig.modelUrl
      }),
      signal
    });

    if (!res.ok) {
      throw new Error(`Backend Error: ${res.status} ${res.statusText}`);
    }

    if (!res.body) throw new Error('No body returned');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      if (signal?.aborted) throw new Error('Cancelled');

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').map(l => l.trim()).filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');

      for (const line of lines) {
        try {
          const text = line.replace(/^data: /, '');
          if (text === '[DONE]') continue;

          if (text.startsWith('[Error]')) {
            throw new Error(text);
          }

          const parsed = JSON.parse(text);
          if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch (e) {
          console.warn('Parse error', line, e);
        }
      }
    }
  }

  static async updateNovel(novelId: string, updates: any) {
    const res = await fetch(`${this.getApiUrl()}/api/novels/${novelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update novel');
    return await res.json();
  }

  static async getNovels() {
    const res = await fetch(`${this.getApiUrl()}/api/novels`);
    if (!res.ok) throw new Error('Failed to fetch novels');
    return await res.json();
  }

  static async getNovel(id: string) {
    const res = await fetch(`${this.getApiUrl()}/api/novels/${id}`);
    if (!res.ok) throw new Error('Failed to fetch novel');
    return await res.json();
  }

  static async deleteNovel(id: string) {
    const res = await fetch(`${this.getApiUrl()}/api/novels/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete novel');
    return await res.json();
  }

  static async getChapters(novelId: string) {
    const res = await fetch(`${this.getApiUrl()}/api/novels/${novelId}/chapters`);
    if (!res.ok) throw new Error('Failed to fetch chapters');
    return await res.json();
  }

  static async getCharacters(novelId: string) {
    const res = await fetch(`${this.getApiUrl()}/api/novels/${novelId}/characters`);
    if (!res.ok) throw new Error('Failed to fetch characters');
    return await res.json();
  }
}
