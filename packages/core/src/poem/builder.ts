import type { PoemGenerateRequest, PoemFromImageRequest, PoemStyle } from '../types'
import { POEM_SYSTEM_PROMPT, POEM_FROM_IMAGE_PROMPT } from './prompts'

const STYLE_HINTS: Record<PoemStyle, string> = {
  '豪放': '风格偏向豪放派，气势雄浑，意境开阔，可参考李白、苏轼风格',
  '婉约': '风格偏向婉约派，细腻含蓄，意境幽远，可参考李清照、柳永风格',
  '田园': '风格偏向田园派，清新自然，恬淡闲适，可参考王维、孟浩然风格',
  '边塞': '风格偏向边塞派，苍凉雄壮，慷慨激昂，可参考王昌龄、高适风格',
  '清新': '风格清新明快，语言灵动，画面感强',
  '古朴': '风格古朴典雅，用词考究，有汉魏古风',
  '自动': '根据主题自动选择最合适的风格',
}

/**
 * 构建纯文字作诗的用户消息
 */
export function buildPoemPrompt(req: PoemGenerateRequest): {
  system: string
  user: string
} {
  const parts: string[] = []

  parts.push(`请以「${req.prompt}」为主题创作。`)

  if (req.genre) {
    parts.push(`体裁要求：${req.genre}。`)
  } else {
    parts.push('体裁：七言绝句（默认，如主题更适合其他体裁可自行调整）。')
  }

  if (req.style && req.style !== '自动') {
    parts.push(STYLE_HINTS[req.style])
  }

  if (req.acrostic) {
    parts.push(`这是一首藏头诗，每句首字依次为：「${req.acrostic}」。全诗语义须通顺自然，不可生硬。`)
  }

  return {
    system: POEM_SYSTEM_PROMPT,
    user: parts.join('\n'),
  }
}

/**
 * 构建图片作诗的用户消息
 */
export function buildImagePoemPrompt(req: PoemFromImageRequest): {
  system: string
  user: string
} {
  const parts: string[] = []

  parts.push('请观察我上传的照片，根据画面意境创作一首古典诗词。')

  if (req.text) {
    parts.push(`我的心情/想法：「${req.text}」`)
  }

  if (req.genre) {
    parts.push(`体裁要求：${req.genre}。`)
  }

  if (req.style && req.style !== '自动') {
    parts.push(STYLE_HINTS[req.style])
  }

  return {
    system: POEM_FROM_IMAGE_PROMPT,
    user: parts.join('\n'),
  }
}
