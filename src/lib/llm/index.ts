interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface LLMRequest {
    apiKey: string;
    modelUrl: string;
    modelName: string;
    messages: LLMMessage[];
    temperature?: number;
    onChunk?: (text: string) => void;
    signal?: AbortSignal;
}

export async function generateContentStream({
    apiKey,
    modelUrl,
    modelName,
    messages,
    temperature = 0.7,
    onChunk,
    signal,
}: LLMRequest): Promise<string> {
    const url = `${modelUrl.replace(/\/$/, '')}/chat/completions`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: modelName,
            messages,
            temperature,
            stream: true,
        }),
        signal,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`LLM API Error (${response.status}): ${errorBody}`);
    }

    if (!response.body) {
        throw new Error('No readable stream returned by the LLM API.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    try {
        while (true) {
            if (signal?.aborted) {
                throw new Error('Generation cancelled by user.');
            }

            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
                .split('\\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('data: ') && line !== 'data: [DONE]');

            for (const line of lines) {
                let text = line.replace(/^data: /, '');
                if (text === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(text);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                        fullText += delta;
                        if (onChunk) onChunk(delta);
                    }
                } catch (e) {
                    console.warn('Failed to parse SSE line:', text, e);
                }
            }
        }
    } finally {
        reader.releaseLock();
    }

    return fullText;
}

export async function generateContent(request: LLMRequest): Promise<string> {
    let text = '';
    await generateContentStream({
        ...request,
        onChunk: (chunk) => {
            text += chunk;
        },
    });
    return text;
}
