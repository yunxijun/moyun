import type { CardBackground, PaperCategory } from '../types'

export interface PaperInfo {
  label: string
  description: string
  /** 渐变底色 [起, 止] */
  baseColors: [string, string]
  /** 文字颜色 */
  textColor: string
  /** 印章颜色 */
  stampColor: string
  /** 纸张分类 */
  category: PaperCategory
  /** 纹理参数 */
  texture: PaperTexture
}

export interface PaperTexture {
  /** 基础噪点数量倍率（相对于面积） */
  noiseDensity: number
  /** 噪点颜色 */
  noiseColors: string[]
  /** 噪点透明度 */
  noiseAlpha: number
  /** 纤维数量 */
  fiberCount: number
  /** 纤维颜色 */
  fiberColor: string
  /** 纤维透明度 */
  fiberAlpha: number
  /** 纤维扩散范围 */
  fiberSpread: number
  /** 纤维线宽 */
  fiberWidth: number
  /** 特殊效果 */
  special?: 'gold-flecks' | 'silver-flecks' | 'wax-sheen' | 'pink-dye' | 'flower-pattern' | 'translucent'
}

export const PAPER_CATEGORIES: Record<PaperCategory, {
  label: string
  description: string
  order: number
}> = {
  '宣纸': { label: '宣纸', description: '安徽泾县，纸中之王，书画首选', order: 1 },
  '竹纸': { label: '竹纸', description: '竹浆所制，科举与日常书写用纸', order: 2 },
  '特种纸': { label: '特种纸', description: '历代名纸，文人雅士珍藏', order: 3 },
  '现代': { label: '现代', description: '现代风格与自定义', order: 4 },
}

export const PAPERS: Record<CardBackground, PaperInfo> = {
  // ===== 宣纸类 =====
  'sheng-xuan': {
    label: '生宣',
    description: '吸墨性强，墨韵浓郁，适合写意与草书',
    baseColors: ['#f5f0e8', '#ede5d5'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '宣纸',
    texture: {
      noiseDensity: 1.5,
      noiseColors: ['#8b7355', '#a08060', '#000'],
      noiseAlpha: 0.04,
      fiberCount: 40,
      fiberColor: '#8b7355',
      fiberAlpha: 0.03,
      fiberSpread: 120,
      fiberWidth: 0.8,
    },
  },
  'shu-xuan': {
    label: '熟宣',
    description: '加矾处理不洇墨，适合工笔与楷书小楷',
    baseColors: ['#faf8f2', '#f2ede4'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '宣纸',
    texture: {
      noiseDensity: 0.6,
      noiseColors: ['#c0b090', '#a09070'],
      noiseAlpha: 0.02,
      fiberCount: 8,
      fiberColor: '#b0a080',
      fiberAlpha: 0.015,
      fiberSpread: 60,
      fiberWidth: 0.3,
    },
  },
  'ban-sheng-shu': {
    label: '半生熟宣',
    description: '介于生熟之间，日常书法最常用',
    baseColors: ['#f7f2ea', '#efe8da'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '宣纸',
    texture: {
      noiseDensity: 1.0,
      noiseColors: ['#8b7355', '#000'],
      noiseAlpha: 0.03,
      fiberCount: 25,
      fiberColor: '#8b7355',
      fiberAlpha: 0.02,
      fiberSpread: 100,
      fiberWidth: 0.5,
    },
  },
  'fang-gu-xuan': {
    label: '仿古宣',
    description: '人工做旧泛黄，适合怀古主题',
    baseColors: ['#e8d5b0', '#d4bc8a'],
    textColor: '#1a1a1a',
    stampColor: '#8b0000',
    category: '宣纸',
    texture: {
      noiseDensity: 2.0,
      noiseColors: ['#6b5030', '#8b6540', '#000'],
      noiseAlpha: 0.05,
      fiberCount: 50,
      fiberColor: '#6b5030',
      fiberAlpha: 0.04,
      fiberSpread: 130,
      fiberWidth: 0.8,
    },
  },
  'sa-jin-xuan': {
    label: '洒金宣',
    description: '纸面洒有金箔，贺寿婚庆御笔专用',
    baseColors: ['#f5f0e8', '#ede5d5'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '宣纸',
    texture: {
      noiseDensity: 1.0,
      noiseColors: ['#8b7355', '#000'],
      noiseAlpha: 0.03,
      fiberCount: 20,
      fiberColor: '#8b7355',
      fiberAlpha: 0.02,
      fiberSpread: 100,
      fiberWidth: 0.5,
      special: 'gold-flecks',
    },
  },
  'chan-yi-xuan': {
    label: '蝉翼宣',
    description: '极薄透光如蝉翼，信笺拓片用纸',
    baseColors: ['#fcfaf6', '#f8f4ed'],
    textColor: '#2a2a2a',
    stampColor: '#cc3333',
    category: '宣纸',
    texture: {
      noiseDensity: 0.3,
      noiseColors: ['#d0c0a0'],
      noiseAlpha: 0.015,
      fiberCount: 15,
      fiberColor: '#c8b898',
      fiberAlpha: 0.02,
      fiberSpread: 80,
      fiberWidth: 0.2,
      special: 'translucent',
    },
  },

  // ===== 竹纸类 =====
  'mao-bian-zhi': {
    label: '毛边纸',
    description: '竹浆微黄，科举考试与日常练字用纸',
    baseColors: ['#efe0c0', '#e5d4a8'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '竹纸',
    texture: {
      noiseDensity: 2.5,
      noiseColors: ['#8b7040', '#6b5530', '#a08850'],
      noiseAlpha: 0.05,
      fiberCount: 60,
      fiberColor: '#7b6535',
      fiberAlpha: 0.04,
      fiberSpread: 90,
      fiberWidth: 1.0,
    },
  },
  'yuan-shu-zhi': {
    label: '元书纸',
    description: '淡黄细腻，民间书写春联用纸',
    baseColors: ['#f2e8ce', '#e8dbb8'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '竹纸',
    texture: {
      noiseDensity: 1.8,
      noiseColors: ['#9b8555', '#7b6840'],
      noiseAlpha: 0.04,
      fiberCount: 35,
      fiberColor: '#8b7545',
      fiberAlpha: 0.03,
      fiberSpread: 80,
      fiberWidth: 0.7,
    },
  },

  // ===== 特种纸 =====
  'cang-jing-zhi': {
    label: '藏经纸',
    description: '硬黄涂蜡防虫，唐宋佛经抄经专用',
    baseColors: ['#d8c080', '#c8ad60'],
    textColor: '#2a1800',
    stampColor: '#8b0000',
    category: '特种纸',
    texture: {
      noiseDensity: 0.8,
      noiseColors: ['#8b6508', '#6b5000'],
      noiseAlpha: 0.03,
      fiberCount: 10,
      fiberColor: '#8b6508',
      fiberAlpha: 0.015,
      fiberSpread: 50,
      fiberWidth: 0.3,
      special: 'wax-sheen',
    },
  },
  'cheng-xin-tang': {
    label: '澄心堂纸',
    description: '南唐御用，质地细密，纸中翘楚',
    baseColors: ['#faf9f5', '#f5f2eb'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '特种纸',
    texture: {
      noiseDensity: 0.4,
      noiseColors: ['#c8c0b0', '#b0a898'],
      noiseAlpha: 0.015,
      fiberCount: 5,
      fiberColor: '#c8c0b0',
      fiberAlpha: 0.01,
      fiberSpread: 40,
      fiberWidth: 0.2,
    },
  },
  'xue-tao-jian': {
    label: '薛涛笺',
    description: '唐代女诗人薛涛所创，深红诗笺',
    baseColors: ['#e8b0a0', '#d89888'],
    textColor: '#2a0800',
    stampColor: '#6b0000',
    category: '特种纸',
    texture: {
      noiseDensity: 1.2,
      noiseColors: ['#a06050', '#805040'],
      noiseAlpha: 0.04,
      fiberCount: 20,
      fiberColor: '#905848',
      fiberAlpha: 0.025,
      fiberSpread: 70,
      fiberWidth: 0.5,
      special: 'pink-dye',
    },
  },
  'hua-jian': {
    label: '花笺',
    description: '染色印花装饰纸，文人雅集信笺',
    baseColors: ['#f0ead8', '#e5dcc5'],
    textColor: '#1a1a1a',
    stampColor: '#cc3333',
    category: '特种纸',
    texture: {
      noiseDensity: 0.8,
      noiseColors: ['#8b7355', '#000'],
      noiseAlpha: 0.025,
      fiberCount: 15,
      fiberColor: '#8b7355',
      fiberAlpha: 0.02,
      fiberSpread: 80,
      fiberWidth: 0.4,
      special: 'flower-pattern',
    },
  },

  // ===== 现代 =====
  'mo-zhi': {
    label: '墨纸',
    description: '深色反白效果，现代感强',
    baseColors: ['#1a1a1a', '#2a2a2a'],
    textColor: '#e8e0d4',
    stampColor: '#cc3333',
    category: '现代',
    texture: {
      noiseDensity: 1.2,
      noiseColors: ['#333', '#444'],
      noiseAlpha: 0.06,
      fiberCount: 15,
      fiberColor: '#444',
      fiberAlpha: 0.03,
      fiberSpread: 80,
      fiberWidth: 0.5,
    },
  },
  'custom-photo': {
    label: '照片背景',
    description: '使用上传的照片作为背景',
    baseColors: ['#f5f0e8', '#ede5d5'],
    textColor: '#ffffff',
    stampColor: '#cc3333',
    category: '现代',
    texture: {
      noiseDensity: 0,
      noiseColors: [],
      noiseAlpha: 0,
      fiberCount: 0,
      fiberColor: '',
      fiberAlpha: 0,
      fiberSpread: 0,
      fiberWidth: 0,
    },
  },
}

/** 按分类获取纸张列表（排序后） */
export function getPapersByCategory(): Array<{
  category: PaperCategory
  label: string
  description: string
  papers: Array<{ key: CardBackground } & PaperInfo>
}> {
  const grouped = new Map<PaperCategory, Array<{ key: CardBackground } & PaperInfo>>()
  for (const [key, info] of Object.entries(PAPERS)) {
    const cat = info.category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push({ key: key as CardBackground, ...info })
  }

  return Object.entries(PAPER_CATEGORIES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([cat, meta]) => ({
      category: cat as PaperCategory,
      label: meta.label,
      description: meta.description,
      papers: grouped.get(cat as PaperCategory) || [],
    }))
    .filter((g) => g.papers.length > 0)
}
