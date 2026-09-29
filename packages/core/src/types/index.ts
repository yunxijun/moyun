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

/** 书法书体（五体 + 扩展） */
export type CalligraphyScript = '楷' | '行' | '草'

/** 字体书体分类 */
export type FontScriptType =
  | '名家'  // Famous Calligraphers
  | '篆'   // Seal Script
  | '隶'   // Clerical Script
  | '楷'   // Regular Script
  | '行'   // Semi-cursive
  | '草'   // Cursive
  | '瘦金'  // Thin Gold Script (reserved)
  | '手写'  // Handwriting
  | '宋楷'  // Song-Kai hybrid

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

/** 书法字体 */
export type CalligraphyFont =
  | 'MaShanZheng'        // 飘逸行书
  | 'LiuJianMaoCao'      // 灵动草书
  | 'ZhiMangXing'        // 秀丽行书
  | 'LongCang'           // 雄浑毛笔
  | 'LxgwWenKai'         // 霞鹜文楷（人文楷书）
  | 'SlideYouRan'        // 演示悠然小楷
  | 'SlideQiuHong'       // 演示秋鸿楷
  | 'HongLeiXingShu'     // 鸿雷行书
  | 'DongFangDaKai'      // 阿里妈妈东方大楷
  | 'ZcoolXiaoWei'       // 站酷小薇（温润宋楷）
  | 'DaoLiTi'            // 阿里妈妈刀隶体（隶书）
  | 'ZcoolQingKeHuangYou' // 站酷庆科黄油体（圆趣手写）
  | 'SlideFu'            // 演示佛系体（禅意手写）
  | 'LongZhuTi'          // 龙珠体（力量手写）
  | 'Yozai'              // 悠哉字体（日系手写）
  | 'AoyagiReisho'       // 青柳隷书（日本书法家挥毫隶书）
  | 'ZiXiaoHunLiShu'     // 字小魂洪亮毛笔隶书
  | 'ShouJinTi'          // 宋徽宗瘦金甲粗版
  | 'XiaoZhuan'          // 三极小篆简
  | 'MaoZeDong'          // 草檀斋毛泽东字体
  | 'NotoSerifSC'        // 思源宋体（典雅宋体）
  | 'ZcoolKuaiLe'        // 站酷快乐体（趣味圆润）
  | 'MaruSC'             // 975圆体（温柔圆体）
  | 'XiaoLai'            // 小赖字体（日系可爱）

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

/** 纸张分类 */
export type PaperCategory = '宣纸' | '竹纸' | '特种纸' | '现代'

/** 卡片背景类型（基于真实纸张） */
export type CardBackground =
  // 宣纸类
  | 'sheng-xuan'       // 生宣
  | 'shu-xuan'         // 熟宣
  | 'ban-sheng-shu'    // 半生熟宣
  | 'fang-gu-xuan'     // 仿古宣
  | 'sa-jin-xuan'      // 洒金宣
  | 'chan-yi-xuan'      // 蝉翼宣
  // 竹纸类
  | 'mao-bian-zhi'     // 毛边纸
  | 'yuan-shu-zhi'     // 元书纸
  // 特种纸
  | 'cang-jing-zhi'    // 藏经纸（金粟山藏经纸）
  | 'cheng-xin-tang'   // 澄心堂纸
  | 'xue-tao-jian'     // 薛涛笺
  | 'hua-jian'         // 花笺
  // 现代
  | 'mo-zhi'           // 墨纸（深色反白）
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
