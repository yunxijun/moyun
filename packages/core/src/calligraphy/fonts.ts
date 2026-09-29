import type { CalligraphyFont, FontScriptType } from '../types'

/** 字体信息 */
export interface FontInfo {
  name: string
  label: string
  description: string
  /** CSS font-family 值（用于 Canvas 渲染） */
  cssFontFamily: string
  /** 字体来源类型 */
  source: 'google-fonts' | 'cn-fontsource' | 'fontsource' | 'fontpkg'
  /** 书体分类 */
  scriptType: FontScriptType
}

/** 书体分类信息 */
export const FONT_SCRIPT_TYPES: Record<FontScriptType, {
  label: string
  description: string
  order: number
}> = {
  '篆': { label: '篆书', description: '古朴圆润，上古遗韵', order: 1 },
  '隶': { label: '隶书', description: '蚕头雁尾，浑厚古拙', order: 2 },
  '楷': { label: '楷书', description: '端正规整，横平竖直', order: 3 },
  '行': { label: '行书', description: '流畅自然，行云流水', order: 4 },
  '草': { label: '草书', description: '奔放洒脱，笔画连绵', order: 5 },
  '手写': { label: '手写体', description: '自然随性，返璞归真', order: 6 },
  '宋楷': { label: '宋楷体', description: '温润典雅，刚柔并济', order: 7 },
}

/** 可用的书法字体 */
export const CALLIGRAPHY_FONTS: Record<CalligraphyFont, FontInfo> = {
  // ── 隶书 ──
  DaoLiTi: {
    name: 'DaoLiTi',
    label: '刀隶体',
    description: '阿里妈妈刀隶体，介于隶楷之间，方笔刚劲',
    cssFontFamily: 'Alimama DaoLiTi',
    source: 'fontpkg',
    scriptType: '隶',
  },

  // ── 楷书 ──
  LxgwWenKai: {
    name: 'LxgwWenKai',
    label: '霞鹜文楷',
    description: '最受欢迎的开源楷书，清秀人文，温润端正',
    cssFontFamily: 'LXGW WenKai',
    source: 'fontsource',
    scriptType: '楷',
  },
  SlideYouRan: {
    name: 'SlideYouRan',
    label: '悠然小楷',
    description: '演示悠然小楷，清秀灵动，带牵丝韵味',
    cssFontFamily: 'slideyouran',
    source: 'cn-fontsource',
    scriptType: '楷',
  },
  SlideQiuHong: {
    name: 'SlideQiuHong',
    label: '秋鸿正楷',
    description: '演示秋鸿楷，方正端庄，笔画均匀俐落',
    cssFontFamily: 'Slideqiuhong',
    source: 'cn-fontsource',
    scriptType: '楷',
  },
  DongFangDaKai: {
    name: 'DongFangDaKai',
    label: '东方大楷',
    description: '阿里妈妈东方大楷，大气磅礴，力透纸背',
    cssFontFamily: 'Alimama DongFangDaKai',
    source: 'cn-fontsource',
    scriptType: '楷',
  },

  // ── 行书 ──
  MaShanZheng: {
    name: 'MaShanZheng',
    label: '马善政体',
    description: '飘逸洒脱，行云流水，适合通用诗词',
    cssFontFamily: 'Ma Shan Zheng',
    source: 'google-fonts',
    scriptType: '行',
  },
  ZhiMangXing: {
    name: 'ZhiMangXing',
    label: '志莽行书',
    description: '秀丽典雅，适合婉约派诗词',
    cssFontFamily: 'Zhi Mang Xing',
    source: 'google-fonts',
    scriptType: '行',
  },
  HongLeiXingShu: {
    name: 'HongLeiXingShu',
    label: '鸿雷行书',
    description: '笔势遒劲，行云流水',
    cssFontFamily: 'hongleixingshu',
    source: 'cn-fontsource',
    scriptType: '行',
  },

  // ── 草书 ──
  LiuJianMaoCao: {
    name: 'LiuJianMaoCao',
    label: '柳建草书',
    description: '奔放灵动，适合豪放派诗词',
    cssFontFamily: 'Liu Jian Mao Cao',
    source: 'google-fonts',
    scriptType: '草',
  },

  // ── 手写体 ──
  LongCang: {
    name: 'LongCang',
    label: '龙藏毛笔',
    description: '雄浑有力，适合对联和匾额',
    cssFontFamily: 'Long Cang',
    source: 'google-fonts',
    scriptType: '手写',
  },

  // ── 宋楷体 ──
  ZcoolXiaoWei: {
    name: 'ZcoolXiaoWei',
    label: '温润宋楷',
    description: '站酷小薇体，温润典雅，宋楷融合之美',
    cssFontFamily: 'ZCOOL XiaoWei',
    source: 'fontsource',
    scriptType: '宋楷',
  },
}

/** 按书体分类获取字体列表 */
export function getFontsByScript(): Array<{
  scriptType: FontScriptType
  label: string
  fonts: Array<{ key: CalligraphyFont } & FontInfo>
}> {
  const grouped = new Map<FontScriptType, Array<{ key: CalligraphyFont } & FontInfo>>()

  for (const [key, info] of Object.entries(CALLIGRAPHY_FONTS) as [CalligraphyFont, FontInfo][]) {
    const list = grouped.get(info.scriptType) || []
    list.push({ key, ...info })
    grouped.set(info.scriptType, list)
  }

  const types = Object.entries(FONT_SCRIPT_TYPES) as [FontScriptType, typeof FONT_SCRIPT_TYPES[FontScriptType]][]
  return types
    .sort((a, b) => a[1].order - b[1].order)
    .map(([st, meta]) => ({
      scriptType: st,
      label: meta.label,
      fonts: grouped.get(st) || [],
    }))
}

/**
 * Google Fonts 镜像列表（国内可用）
 */
const FONT_MIRRORS = [
  'https://fonts.googleapis.cn',
  'https://fonts.loli.net',
  'https://fonts.googleapis.com',
]

export function getCalligraphyFontUrl(font: CalligraphyFont, mirrorIndex = 0): string {
  const family = CALLIGRAPHY_FONTS[font].cssFontFamily
  const base = FONT_MIRRORS[mirrorIndex] || FONT_MIRRORS[0]
  return `${base}/css2?family=${encodeURIComponent(family)}&display=swap`
}

export function getCalligraphyFontUrls(font: CalligraphyFont): string[] {
  const family = CALLIGRAPHY_FONTS[font].cssFontFamily
  return FONT_MIRRORS.map(base => `${base}/css2?family=${encodeURIComponent(family)}&display=swap`)
}
