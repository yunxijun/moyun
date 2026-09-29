import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
  baseURL: process.env.LLM_BASE_URL || 'https://api.deepseek.com',
  timeout: 60_000,
  maxRetries: 1,
})

const MODEL = process.env.LLM_MODEL || 'deepseek-chat'

/**
 * 调用 LLM 生成文本（非流式）
 */
export async function callLLM(system: string, user: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.8,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('LLM 返回内容为空')
  return content
}

/**
 * 流式调用 LLM，通过回调逐 token 输出
 */
export async function callLLMStream(
  system: string,
  user: string,
  onToken: (token: string) => void,
): Promise<string> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.8,
    max_tokens: 1024,
    stream: true,
  })

  let full = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || ''
    if (delta) {
      full += delta
      onToken(delta)
    }
  }

  return full
}

/**
 * 调用多模态 VLM 生成文本
 */
export async function callVisionLLM(
  system: string,
  user: string,
  imageUrls: string[],
): Promise<string> {
  const imageMessages: OpenAI.ChatCompletionContentPart[] = imageUrls.map((url) => ({
    type: 'image_url' as const,
    image_url: { url },
  }))

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          ...imageMessages,
          { type: 'text', content: user },
        ],
      },
    ],
    temperature: 0.8,
    max_tokens: 1024,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('VLM 返回内容为空')
  return content
}
