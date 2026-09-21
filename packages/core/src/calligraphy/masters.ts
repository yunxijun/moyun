import type { Calligrapher, CalligraphyScript } from '../types'

/** UniCalli 支持的书法家列表 */
export const CALLIGRAPHERS: Array<{
  name: Calligrapher
  label: string
  dynasty: string
  description: string
  styles: CalligraphyScript[]
}> = [
  {
    name: '王羲之',
    label: '王羲之 · 书圣',
    dynasty: '东晋',
    description: '书圣，行书飘逸洒脱，《兰亭集序》为天下第一行书',
    styles: ['行', '楷', '草'],
  },
  {
    name: '颜真卿',
    label: '颜真卿 · 颜体',
    dynasty: '唐',
    description: '雄浑厚重，端庄大气，楷书四大家之一',
    styles: ['楷', '行'],
  },
  {
    name: '欧阳询',
    label: '欧阳询 · 欧体',
    dynasty: '唐',
    description: '险劲严谨，结构精密，楷书四大家之一',
    styles: ['楷', '行'],
  },
  {
    name: '赵佶',
    label: '宋徽宗 · 瘦金体',
    dynasty: '宋',
    description: '瘦金体独创者，笔画瘦硬挺拔，风格独一无二',
    styles: ['楷'],
  },
  {
    name: '黄庭坚',
    label: '黄庭坚 · 山谷',
    dynasty: '宋',
    description: '纵横开阔，长枪大戟，宋四家之一',
    styles: ['行', '草'],
  },
  {
    name: '柳公权',
    label: '柳公权 · 柳体',
    dynasty: '唐',
    description: '骨力遒劲，结构严谨，楷书四大家之一',
    styles: ['楷'],
  },
  {
    name: '赵孟頫',
    label: '赵孟頫 · 赵体',
    dynasty: '元',
    description: '圆润秀美，温文尔雅，楷书四大家之一',
    styles: ['楷', '行', '草'],
  },
  {
    name: null,
    label: '通用风格',
    dynasty: '',
    description: 'AI 综合风格，融合多家笔意',
    styles: ['楷', '行', '草'],
  },
]

/** 书体说明 */
export const CALLIGRAPHY_SCRIPTS: Record<CalligraphyScript, {
  label: string
  description: string
}> = {
  '楷': {
    label: '楷书',
    description: '端正规整，横平竖直，最易辨认',
  },
  '行': {
    label: '行书',
    description: '流畅自然，介于楷草之间，最为常用',
  },
  '草': {
    label: '草书',
    description: '奔放洒脱，笔画连绵，艺术感最强',
  },
}
