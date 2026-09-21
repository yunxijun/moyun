import type { CalligraphyFont } from '../types'

/** MVP 阶段可用的书法字体 */
export const CALLIGRAPHY_FONTS: Record<CalligraphyFont, {
  name: string
  label: string
  description: string
  googleFontsFamily: string
}> = {
  MaShanZheng: {
    name: 'MaShanZheng',
    label: '飘逸行书',
    description: '马善政体，行云流水，适合通用诗词',
    googleFontsFamily: 'Ma Shan Zheng',
  },
  LiuJianMaoCao: {
    name: 'LiuJianMaoCao',
    label: '灵动草书',
    description: '柳建毛草体，奔放灵动，适合豪放派诗词',
    googleFontsFamily: 'Liu Jian Mao Cao',
  },
  ZhiMangXing: {
    name: 'ZhiMangXing',
    label: '秀丽行书',
    description: '志莽行体，秀丽典雅，适合婉约派诗词',
    googleFontsFamily: 'Zhi Mang Xing',
  },
  LongCang: {
    name: 'LongCang',
    label: '雄浑毛笔',
    description: '龙藏体，雄浑有力，适合对联和匾额',
    googleFontsFamily: 'Long Cang',
  },
}

/**
 * 获取 Google Fonts CSS URL
 */
export function getCalligraphyFontUrl(font: CalligraphyFont): string {
  const family = CALLIGRAPHY_FONTS[font].googleFontsFamily
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`
}
