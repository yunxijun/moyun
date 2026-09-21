import type { CardTemplate, CardBackground } from '../types'

/** 卡片模板定义 */
export const CARD_TEMPLATES: Record<CardTemplate, {
  label: string
  width: number
  height: number
  description: string
}> = {
  vertical: {
    label: '竖版',
    width: 1080,
    height: 1440,
    description: '3:4 竖版，适合小红书和朋友圈',
  },
  horizontal: {
    label: '横版',
    width: 1440,
    height: 1080,
    description: '4:3 横版，适合微博和桌面壁纸',
  },
  square: {
    label: '方形',
    width: 1080,
    height: 1080,
    description: '1:1 方形，适合头像和 Instagram',
  },
  'poem-sign': {
    label: '诗签',
    width: 540,
    height: 1440,
    description: '细长竖条，古风诗签样式',
  },
}

/** 卡片背景定义 */
export const CARD_BACKGROUNDS: Record<CardBackground, {
  label: string
  textColor: string
  stampColor: string
  description: string
}> = {
  'xuan-paper': {
    label: '宣纸米色',
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    description: '经典宣纸底色，最常用',
  },
  'xuan-paper-warm': {
    label: '宣纸暖白',
    textColor: '#2a2a2a',
    stampColor: '#cc3333',
    description: '略带暖色的白纸底',
  },
  'xuan-paper-aged': {
    label: '仿古铜色',
    textColor: '#1a1a1a',
    stampColor: '#8b0000',
    description: '泛黄古旧效果，适合怀古主题',
  },
  'dark-ink': {
    label: '墨色深底',
    textColor: '#e8e0d4',
    stampColor: '#cc3333',
    description: '深色反白效果，现代感强',
  },
  'custom-photo': {
    label: '照片背景',
    textColor: '#ffffff',
    stampColor: '#cc3333',
    description: '使用用户上传的照片作为背景',
  },
}
