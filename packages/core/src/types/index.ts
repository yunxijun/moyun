/** 诗词体裁 */
export type PoemGenre =
  | '五言绝句'
  | '七言绝句'
  | '五言律诗'
  | '七言律诗'
  | '词'
  | '对联'

/** 诗词风格 */
export type PoemStyle =
  | '豪放'
  | '婉约'
  | '田园'
  | '边塞'
  | '清新'
  | '古朴'
  | '自动'

/** 书法书体 */
export type CalligraphyScript = '楷' | '行' | '草'

/** 书法家 */
export type Calligrapher =
  | '王羲之'
  | '颜真卿'
  | '欧阳询'
  | '赵佶'
  | '黄庭坚'
  | '柳公权'
  | '赵孟頫'
  | null

/** 书法字体（MVP 阶段使用） */
export type CalligraphyFont =
  | 'MaShanZheng'   // 飘逸行书
  | 'LiuJianMaoCao' // 灵动草书
  | 'ZhiMangXing'   // 秀丽行书
  | 'LongCang'      // 雄浑毛笔

/** AI 生成的诗词结果 */
export interface PoemResult {
  title: string
  genre: PoemGenre
  rhyme?: string
  content: string[]
  translation: string
  appreciation: string
}

/** AI 生成的对联结果 */
export interface CoupletResult {
  type: '对联'
  upper: string
  lower: string
  horizontal: string
  appreciation: string
}

/** 诗词生成请求（纯文字） */
export interface PoemGenerateRequest {
  /** 用户输入的主题/关键词/心情 */
  prompt: string
  /** 体裁 */
  genre?: PoemGenre
  /** 风格 */
  style?: PoemStyle
  /** 藏头文字（如有） */
  acrostic?: string
}

/** 图片作诗请求（多模态） */
export interface PoemFromImageRequest {
  /** 图片 URL 列表（1-3张） */
  imageUrls: string[]
  /** 用户附加文字（可选） */
  text?: string
  /** 体裁 */
  genre?: PoemGenre
  /** 风格 */
  style?: PoemStyle
}

/** 书法渲染请求 */
export interface CalligraphyRenderRequest {
  /** 要渲染的文字内容 */
  text: string[]
  /** 书法字体（MVP） */
  font?: CalligraphyFont
  /** 书法家（V2，使用 UniCalli） */
  calligrapher?: Calligrapher
  /** 书体 */
  script?: CalligraphyScript
}

/** 书法渲染结果 */
export interface CalligraphyRenderResult {
  /** 渲染后的图片 URL */
  imageUrl: string
  /** 渲染方式 */
  method: 'font' | 'unicalli'
}

/** 卡片模板类型 */
export type CardTemplate =
  | 'vertical'    // 竖版（3:4）
  | 'horizontal'  // 横版（4:3）
  | 'square'      // 方形（1:1）
  | 'poem-sign'   // 诗签（细长竖条）

/** 卡片背景类型 */
export type CardBackground =
  | 'xuan-paper'       // 宣纸米色
  | 'xuan-paper-warm'  // 宣纸暖白
  | 'xuan-paper-aged'  // 宣纸古铜
  | 'dark-ink'         // 深色墨色
  | 'custom-photo'     // 用户照片背景

/** 卡片配置 */
export interface CardConfig {
  template: CardTemplate
  background: CardBackground
  /** 用户自定义背景图（当 background 为 custom-photo 时） */
  backgroundImageUrl?: string
  /** 印章文字 */
  stampText?: string
  /** 落款文字 */
  signatureText?: string
  /** 是否显示「墨韵AI」水印 */
  showWatermark: boolean
}

/** 用户信息 */
export interface UserProfile {
  id: string
  nickname: string
  avatarUrl?: string
  /** 会员类型 */
  membership: 'free' | 'monthly' | 'yearly'
  /** 今日已用免费次数 */
  dailyUsed: number
  /** 每日免费额度 */
  dailyLimit: number
  /** 创作总数 */
  totalCreations: number
}

/** API 响应包装 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
