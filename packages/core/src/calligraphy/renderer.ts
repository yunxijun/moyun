import type { CalligraphyFont, CardTemplate, CardBackground, PoemResult } from '../types'
import { CALLIGRAPHY_FONTS } from './fonts'
import { CARD_TEMPLATES, CARD_BACKGROUNDS } from './templates'
import { PAPERS, type PaperTexture } from './papers'

export type BorderStyle =
  | 'none'          // 无边框
  | 'su-xian'       // 素线框（单线）
  | 'zi-xian'       // 子母线（内外双线）
  | 'hui-wen'       // 回纹（商周青铜器纹样）
  | 'wan-zi'        // 万字纹（佛教吉祥纹）
  | 'ru-yi'         // 如意纹（如意头四角）
  | 'gui-jiao'      // 圭角（L型转角纹）
  | 'chan-zhi'       // 缠枝纹（缠枝花卉连续纹样）
  | 'yun-lei'       // 云雷纹（青铜器经典纹）
export type TextureIntensity = 'none' | 'light' | 'medium' | 'heavy'
export type TextureType =
  | 'su-mian'       // 素面（无纹理）
  | 'lian-wen'      // 帘纹（竹帘横线）
  | 'luo-wen'       // 罗纹（丝罗波纹）
  | 'mian-xian-wei' // 棉料纹（棉纤维）
  | 'ma-xian-wei'   // 麻纹（粗麻纤维）
  | 'yun-mu-jian'   // 云母笺（闪光微粒）
  | 'bing-lie-wen'  // 冰裂纹（揉纸裂纹）
  | 'shui-bo-wen'   // 水波纹（波浪曲线）
export type StampPosition = 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left'

export interface BorderInfo {
  label: string
  description: string
  origin: string
}

export const BORDER_STYLES: Record<BorderStyle, BorderInfo> = {
  'none': { label: '无边框', description: '清净无饰，留白为美', origin: '文人审美' },
  'su-xian': { label: '素线框', description: '单线环绕，简洁素雅', origin: '书画装裱基本功' },
  'zi-xian': { label: '子母线', description: '粗细双线，内外呼应', origin: '传统装裱标准格式' },
  'hui-wen': { label: '回纹', description: '连续回旋折线，寓意吉祥绵延', origin: '商周青铜器纹样' },
  'wan-zi': { label: '万字纹', description: '卍字连续排列，福寿万年', origin: '佛教吉祥符号' },
  'ru-yi': { label: '如意纹', description: '四角如意云头装饰', origin: '如意形制，事事如意' },
  'gui-jiao': { label: '圭角', description: '转角方折 L 型纹饰', origin: '古代玉圭形制' },
  'chan-zhi': { label: '缠枝纹', description: '枝蔓缠绕连续不断', origin: '明清瓷器/织物经典' },
  'yun-lei': { label: '云雷纹', description: '圆弧回旋纹样，庄重大气', origin: '商代青铜器纹饰' },
}

export const TEXTURE_INTENSITIES: Record<TextureIntensity, { label: string }> = {
  none: { label: '无纹理' },
  light: { label: '轻纹理' },
  medium: { label: '中纹理' },
  heavy: { label: '重纹理' },
}

export interface TextureInfo {
  label: string
  description: string
  /** 纹理来源 */
  origin: string
}

export const TEXTURE_TYPES: Record<TextureType, TextureInfo> = {
  'su-mian': {
    label: '素面',
    description: '纯净纸面，不施任何纹理',
    origin: '造纸基本形态',
  },
  'lian-wen': {
    label: '帘纹',
    description: '竹帘痕迹，细密平行横线',
    origin: '宣纸竹帘抄纸工艺',
  },
  'luo-wen': {
    label: '罗纹',
    description: '丝罗织物般的细腻波纹',
    origin: '罗纹纸抄造工艺',
  },
  'mian-xian-wei': {
    label: '棉纤维',
    description: '棉料纤维自然散落，柔和温润',
    origin: '棉浆造纸的天然纤维',
  },
  'ma-xian-wei': {
    label: '麻纤维',
    description: '粗犷有力的长纤维纹路',
    origin: '蔡伦造纸以麻为料',
  },
  'yun-mu-jian': {
    label: '云母笺',
    description: '纸面撒入云母粉，微微闪光',
    origin: '唐代云母笺装饰工艺',
  },
  'bing-lie-wen': {
    label: '冰裂纹',
    description: '揉纸后展平形成的不规则裂纹',
    origin: '揉纸技法 / 宋代冰裂瓷纹',
  },
  'shui-bo-wen': {
    label: '水波纹',
    description: '行云流水般的平行波浪',
    origin: '水纹纸工艺',
  },
}

export const STAMP_POSITIONS: Record<StampPosition, { label: string }> = {
  'bottom-left': { label: '左下' },
  'bottom-right': { label: '右下' },
  'top-right': { label: '右上' },
  'top-left': { label: '左上' },
}

/** 印章形状选项 */
export const STAMP_SHAPES: Record<string, { label: string; description: string }> = {
  'square':  { label: '方印', description: '端正庄重，最传统的印章形制' },
  'round':   { label: '圆印', description: '圆朱文，温润典雅' },
  'oval':    { label: '椭圆', description: '长圆印，秀气舒展' },
}

/** 印章字体选项（篆隶优先） */
export const STAMP_FONTS: Record<string, { label: string; family: string }> = {
  'xiaozhuan': { label: '篆书', family: 'XiaoZhuan, "STXinwei", serif' },
  'lishu': { label: '隶书', family: '"Alimama DaoLiTi", "STLiti", "LiSu", serif' },
  'simsun': { label: '宋体', family: '"SimSun", "STSong", serif' },
  'kaishu': { label: '楷体', family: '"STKaiti", "KaiTi", serif' },
  'mashan': { label: '行书', family: '"Ma Shan Zheng", serif' },
}

/** 渲染配置 */
export interface RenderOptions {
  poem: PoemResult
  font: CalligraphyFont
  template: CardTemplate
  background: CardBackground
  stampText?: string
  /** @deprecated 使用 colophon 代替 */
  signatureText?: string
  showWatermark?: boolean
  /** 落款配置 */
  colophon?: {
    /** 书者名，默认「墨韵」 */
    calligrapher?: string
    /** 是否显示日期，默认 true */
    showDate?: boolean
    /** 动作词：「书」「录」「谨录」「题」等 */
    verb?: string
    /** 落款排列：'auto' 自动 | 'single' 合为一列 | 'multi' 每项一列 */
    layout?: 'auto' | 'single' | 'multi'
    /** 落款横向偏移（像素） */
    offsetX?: number
    /** 落款纵向偏移（像素） */
    offsetY?: number
  }
  /** 自定义画布宽度（像素），覆盖模板宽度 */
  customWidth?: number
  /** 自定义画布高度（像素），覆盖模板高度 */
  customHeight?: number
  /** 列间距缩放比例，默认 1.0（基准 = fontSize × 1.8） */
  colSpacingScale?: number
  /** 字间距缩放比例，默认 1.0（基准 = fontSize × 1.4） */
  charSpacingScale?: number
  /** 字号缩放比例，默认 1.0，范围 0.6 ~ 1.6 */
  fontScale?: number
  /** 边框样式 */
  borderStyle?: BorderStyle
  /** 纸张纹理强度：'none' | 'light' | 'medium' | 'heavy'，默认 'medium' */
  textureIntensity?: TextureIntensity
  /** 纹理类型，默认 'mian-xian-wei' */
  textureType?: TextureType
  /** 纹理浓淡（0~200，100 为标准），覆盖 textureIntensity */
  textureStrength?: number
  /** 印章位置（预设四角） */
  stampPosition?: StampPosition
  /** 印章自由位置 X（0~1 百分比，优先于 stampPosition） */
  stampX?: number
  /** 印章自由位置 Y（0~1 百分比，优先于 stampPosition） */
  stampY?: number
  /** 印章字体 key */
  stampFont?: string
  /** 整体水平偏移（像素），正值向右 */
  offsetX?: number
  /** 整体垂直偏移（像素），正值向下 */
  offsetY?: number
  /** 印章尺寸（像素），默认 56 */
  stampSize?: number
  /** 印章形状，默认 square */
  stampShape?: string
  /** 自定义背景图（当 background 为 custom-photo 时），已加载的 Image 对象 */
  backgroundImage?: HTMLImageElement | null
}

/**
 * 在 Canvas 上渲染书法诗词卡片
 * 兼容 uni-app Canvas 2D API 和浏览器原生 Canvas
 */
export function renderCalligraphyCard(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
): void {
  const tmpl = CARD_TEMPLATES[options.template]
  const paper = PAPERS[options.background]
  const bg = paper
    ? { label: paper.label, textColor: paper.textColor, stampColor: paper.stampColor, description: paper.description }
    : CARD_BACKGROUNDS[options.background] || { label: '默认', textColor: '#1a1a1a', stampColor: '#cc3333', description: '' }
  const fontInfo = CALLIGRAPHY_FONTS[options.font]
  const { poem } = options

  const W = options.customWidth ?? tmpl.width
  const H = options.customHeight ?? tmpl.height

  const textureIntensity = options.textureIntensity ?? 'medium'
  const textureType = options.textureType ?? 'mian-xian-wei'
  const textureStrength = options.textureStrength
  const borderStyle = options.borderStyle ?? 'double'
  const fontScale = clamp(options.fontScale ?? 1.0, 0.6, 1.6)
  const stampPosition = options.stampPosition ?? 'bottom-left'
  const ox = options.offsetX ?? 0
  const oy = options.offsetY ?? 0

  // 1. 绘制背景
  if (options.background === 'custom-photo' && options.backgroundImage) {
    drawPhotoBackground(ctx, W, H, options.backgroundImage)
  } else {
    drawBackground(ctx, W, H, options.background, textureIntensity, textureType, textureStrength)
  }

  // 2. 绘制装饰边框
  drawBorder(ctx, W, H, bg.textColor, borderStyle)

  // 3. 绘制诗词正文（竖排）— 应用偏移，返回正文区域信息
  const colSpacingScale = clamp(options.colSpacingScale ?? 1.0, 0.5, 2.0)
  const charSpacingScale = clamp(options.charSpacingScale ?? 1.0, 0.5, 2.0)
  const poemLayout = drawVerticalPoem(ctx, W, H, poem.content, fontInfo.cssFontFamily, bg.textColor, fontScale, ox, oy, colSpacingScale, charSpacingScale)

  // 4. 绘制传统落款（诗题 + 书者 + 日期，竖排在正文左侧）
  const colophon = options.colophon ?? {}
  const colophonLines = buildColophonLines(poem.title, colophon.calligrapher ?? '墨韵', colophon.verb ?? '书', colophon.showDate !== false, colophon.layout ?? 'auto')
  drawColophon(ctx, W, H, poemLayout, colophonLines, bg.textColor, fontInfo.cssFontFamily, colophon.offsetX ?? 0, colophon.offsetY ?? 0)

  // 5. 绘制印章（紧跟落款下方）
  const stamp = options.stampText || '墨韵'
  const stampFontFamily = options.stampFont && STAMP_FONTS[options.stampFont]
    ? STAMP_FONTS[options.stampFont].family
    : STAMP_FONTS['simsun'].family

  if (options.stampX !== undefined && options.stampY !== undefined) {
    drawStamp(ctx, W, H, stamp, bg.stampColor, stampPosition, stampFontFamily, options.stampX, options.stampY, options.stampSize, options.stampShape)
  } else {
    drawStamp(ctx, W, H, stamp, bg.stampColor, stampPosition, stampFontFamily, undefined, undefined, options.stampSize, options.stampShape)
  }

  // 6. 水印
  if (options.showWatermark !== false) {
    drawWatermark(ctx, W, H)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 纹理强度倍率 */
const INTENSITY_MULTIPLIER: Record<TextureIntensity, number> = {
  none: 0,
  light: 0.5,
  medium: 1.0,
  heavy: 1.8,
}

/** 绘制背景 */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  bgType: CardBackground,
  textureIntensity: TextureIntensity = 'medium',
  textureType: TextureType = 'mian-xian-wei',
  textureStrength?: number,
): void {
  const paper = PAPERS[bgType] || PAPERS['ban-sheng-shu']
  const [c1, c2] = paper.baseColors

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, c1)
  grad.addColorStop(1, c2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  if (bgType === 'custom-photo') return
  if (textureType === 'su-mian') {
    const tex = paper.texture
    if (tex.special) drawSpecialEffect(ctx, W, H, tex.special, 1.0)
    return
  }

  const mult = textureStrength != null
    ? textureStrength / 100
    : INTENSITY_MULTIPLIER[textureIntensity]
  if (mult <= 0) return

  // 纸张自带特殊效果（洒金/蜡光等）始终保留
  const tex = paper.texture
  if (tex.special) {
    drawSpecialEffect(ctx, W, H, tex.special, mult)
  }

  // 绘制用户选择的纹理类型
  drawTextureByType(ctx, W, H, textureType, mult, paper)
}

/** 根据纹理类型绘制对应纹理 */
function drawTextureByType(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textureType: TextureType,
  mult: number,
  paper: import('./papers').PaperInfo,
): void {
  const isDark = paper.category === '现代' && paper.textColor !== '#1a1a1a'
  const inkColor = isDark ? '#555' : '#8b7355'
  const inkColorLight = isDark ? '#444' : '#b0a080'

  switch (textureType) {
    case 'su-mian':
      break

    case 'lian-wen':
      drawLianWen(ctx, W, H, mult, inkColor)
      break

    case 'luo-wen':
      drawLuoWen(ctx, W, H, mult, inkColor)
      break

    case 'mian-xian-wei':
      drawMianXianWei(ctx, W, H, mult, inkColor, inkColorLight)
      break

    case 'ma-xian-wei':
      drawMaXianWei(ctx, W, H, mult, inkColor)
      break

    case 'yun-mu-jian':
      drawYunMuJian(ctx, W, H, mult)
      break

    case 'bing-lie-wen':
      drawBingLieWen(ctx, W, H, mult, inkColor)
      break

    case 'shui-bo-wen':
      drawShuiBoWen(ctx, W, H, mult, inkColor)
      break
  }

  ctx.globalAlpha = 1.0
}

/** 帘纹：竹帘抄纸留下的细密平行横线 */
function drawLianWen(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number, color: string,
): void {
  const gap = 5 + Math.round(2 / mult)
  ctx.globalAlpha = 0.12 * mult
  ctx.strokeStyle = color
  ctx.lineWidth = 0.8
  for (let y = 0; y < H; y += gap) {
    ctx.beginPath()
    ctx.moveTo(0, y + (Math.random() - 0.5) * 0.5)
    let x = 0
    while (x < W) {
      x += 15 + Math.random() * 25
      ctx.lineTo(x, y + (Math.random() - 0.5) * 0.8)
    }
    ctx.stroke()
  }
}

/** 罗纹：丝罗织物般的细腻波状纹路 */
function drawLuoWen(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number, color: string,
): void {
  const gap = 7 + Math.round(3 / mult)
  const amp = 2.5 * mult
  const freq = 0.018
  ctx.globalAlpha = 0.1 * mult
  ctx.strokeStyle = color
  ctx.lineWidth = 0.6
  for (let y = 0; y < H; y += gap) {
    ctx.beginPath()
    const phase = Math.random() * Math.PI * 2
    for (let x = 0; x <= W; x += 3) {
      const dy = Math.sin(x * freq + phase) * amp
      if (x === 0) ctx.moveTo(x, y + dy)
      else ctx.lineTo(x, y + dy)
    }
    ctx.stroke()
  }
}

/** 棉纤维：棉料纤维自然散落，柔软短弧线 */
function drawMianXianWei(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number, color: string, colorLight: string,
): void {
  const area = (W * H) / (1080 * 1440)
  const noiseCount = Math.round(3000 * area * mult)
  const fiberCount = Math.round(60 * mult)

  ctx.globalAlpha = 0.08 * mult
  for (let i = 0; i < noiseCount; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? color : colorLight
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 0.07 * mult
  ctx.strokeStyle = color
  ctx.lineWidth = 0.6
  for (let i = 0; i < fiberCount; i++) {
    const x1 = Math.random() * W
    const y1 = Math.random() * H
    const spread = 60 + Math.random() * 50
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(
      x1 + (Math.random() - 0.5) * spread,
      y1 + (Math.random() - 0.5) * spread,
      x1 + (Math.random() - 0.5) * spread * 1.2,
      y1 + (Math.random() - 0.5) * spread * 1.2,
    )
    ctx.stroke()
  }
}

/** 麻纤维：粗犷有力的长纤维纹路 */
function drawMaXianWei(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number, color: string,
): void {
  const fiberCount = Math.round(80 * mult)
  ctx.globalAlpha = 0.12 * mult
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  for (let i = 0; i < fiberCount; i++) {
    const x1 = Math.random() * W
    const y1 = Math.random() * H
    const len = 100 + Math.random() * 180
    const angle = Math.random() * Math.PI
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    const mx = x1 + Math.cos(angle) * len * 0.5 + (Math.random() - 0.5) * 40
    const my = y1 + Math.sin(angle) * len * 0.5 + (Math.random() - 0.5) * 40
    const x2 = x1 + Math.cos(angle) * len
    const y2 = y1 + Math.sin(angle) * len
    ctx.quadraticCurveTo(mx, my, x2, y2)
    ctx.stroke()
  }

  const area = (W * H) / (1080 * 1440)
  const noiseCount = Math.round(4000 * area * mult)
  ctx.globalAlpha = 0.1 * mult
  for (let i = 0; i < noiseCount; i++) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 云母笺：纸面撒入云母粉，微微闪光 */
function drawYunMuJian(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number,
): void {
  const count = Math.round(200 * mult)
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const size = 2 + Math.random() * 5
    ctx.globalAlpha = 0.15 + Math.random() * 0.25
    const hue = 40 + Math.random() * 20
    const light = 75 + Math.random() * 15
    ctx.fillStyle = `hsl(${hue}, 20%, ${light}%)`
    ctx.beginPath()
    ctx.ellipse(x, y, size, size * (0.3 + Math.random() * 0.7), Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1.0
}

/** 冰裂纹：揉纸后展平形成的不规则网状裂纹 */
function drawBingLieWen(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number, color: string,
): void {
  ctx.globalAlpha = 0.12 * mult
  ctx.strokeStyle = color
  ctx.lineWidth = 0.8

  const seeds: Array<[number, number]> = []
  const count = Math.round(30 * mult)
  for (let i = 0; i < count; i++) {
    seeds.push([Math.random() * W, Math.random() * H])
  }

  for (const [sx, sy] of seeds) {
    const branches = 3 + Math.floor(Math.random() * 5)
    for (let b = 0; b < branches; b++) {
      ctx.beginPath()
      let cx = sx
      let cy = sy
      ctx.moveTo(cx, cy)
      const segments = 4 + Math.floor(Math.random() * 6)
      for (let s = 0; s < segments; s++) {
        const angle = Math.random() * Math.PI * 2
        const dist = 25 + Math.random() * 70
        cx += Math.cos(angle) * dist
        cy += Math.sin(angle) * dist
        ctx.lineTo(cx, cy)
      }
      ctx.stroke()
    }
  }
}

/** 水波纹：行云流水般的平行波浪 */
function drawShuiBoWen(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, mult: number, color: string,
): void {
  const gap = 14 + Math.round(6 / mult)
  const amp = 6 * mult
  const freq = 0.008 + Math.random() * 0.004
  ctx.globalAlpha = 0.1 * mult
  ctx.strokeStyle = color
  ctx.lineWidth = 0.8
  const phase0 = Math.random() * Math.PI * 2
  for (let y = 0; y < H; y += gap) {
    const phase = phase0 + y * 0.002
    ctx.beginPath()
    for (let x = 0; x <= W; x += 4) {
      const dy = Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.35
      if (x === 0) ctx.moveTo(x, y + dy)
      else ctx.lineTo(x, y + dy)
    }
    ctx.stroke()
  }
}

/** 绘制照片背景（cover 裁剪 + 半透明遮罩保证文字可读） */
function drawPhotoBackground(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  img: HTMLImageElement,
): void {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const scale = Math.max(W / iw, H / ih)
  const sw = W / scale
  const sh = H / scale
  const sx = (iw - sw) / 2
  const sy = (ih - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillRect(0, 0, W, H)
}

/** 绘制特殊效果 */
function drawSpecialEffect(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  effect: NonNullable<PaperTexture['special']>,
  mult: number,
): void {
  switch (effect) {
    case 'gold-flecks':
    case 'silver-flecks': {
      const isGold = effect === 'gold-flecks'
      const count = Math.round(60 * mult)
      for (let i = 0; i < count; i++) {
        const x = Math.random() * W
        const y = Math.random() * H
        const size = 2 + Math.random() * 6
        ctx.globalAlpha = 0.15 + Math.random() * 0.25
        ctx.fillStyle = isGold
          ? `hsl(${42 + Math.random() * 10}, ${70 + Math.random() * 20}%, ${55 + Math.random() * 20}%)`
          : `hsl(0, 0%, ${75 + Math.random() * 15}%)`
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, size, size * (0.5 + Math.random()))
        } else {
          ctx.beginPath()
          ctx.arc(x, y, size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1.0
      break
    }

    case 'wax-sheen': {
      const sheenGrad = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.6)
      sheenGrad.addColorStop(0, 'rgba(255, 255, 240, 0.08)')
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 240, 0)')
      sheenGrad.addColorStop(1, 'rgba(255, 255, 240, 0.04)')
      ctx.fillStyle = sheenGrad
      ctx.fillRect(0, 0, W, H)
      break
    }

    case 'pink-dye': {
      const dyeGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6)
      dyeGrad.addColorStop(0, 'rgba(180, 60, 60, 0.06)')
      dyeGrad.addColorStop(1, 'rgba(180, 60, 60, 0)')
      ctx.fillStyle = dyeGrad
      ctx.fillRect(0, 0, W, H)
      break
    }

    case 'flower-pattern': {
      const count = Math.round(8 * mult)
      ctx.globalAlpha = 0.04 * mult
      for (let i = 0; i < count; i++) {
        const cx = Math.random() * W
        const cy = Math.random() * H
        const petalR = 20 + Math.random() * 30
        ctx.strokeStyle = '#8b5e3c'
        ctx.lineWidth = 0.8
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2
          ctx.beginPath()
          ctx.ellipse(
            cx + Math.cos(angle) * petalR * 0.5,
            cy + Math.sin(angle) * petalR * 0.5,
            petalR, petalR * 0.4,
            angle, 0, Math.PI * 2,
          )
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1.0
      break
    }

    case 'translucent': {
      ctx.globalAlpha = 0.03
      const tGrad = ctx.createLinearGradient(0, 0, W, H)
      tGrad.addColorStop(0, '#fff')
      tGrad.addColorStop(0.5, 'transparent')
      tGrad.addColorStop(1, '#fff')
      ctx.fillStyle = tGrad
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1.0
      break
    }
  }
}

/** 绘制装饰边框 */
function drawBorder(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  color: string,
  borderStyle: BorderStyle = 'zi-xian',
): void {
  if (borderStyle === 'none') return

  const M = 60
  const L = M
  const R = W - M
  const T = M
  const B = H - M

  ctx.strokeStyle = color

  switch (borderStyle) {
    case 'su-xian':
      ctx.globalAlpha = 0.18
      ctx.lineWidth = 2
      ctx.strokeRect(L, T, R - L, B - T)
      break

    case 'zi-xian': {
      ctx.globalAlpha = 0.2
      ctx.lineWidth = 2.5
      ctx.strokeRect(L, T, R - L, B - T)
      ctx.globalAlpha = 0.1
      ctx.lineWidth = 0.8
      ctx.strokeRect(L + 8, T + 8, R - L - 16, B - T - 16)
      break
    }

    case 'hui-wen':
      drawHuiWen(ctx, L, T, R, B, color)
      break

    case 'wan-zi':
      drawWanZi(ctx, L, T, R, B, color)
      break

    case 'ru-yi':
      drawRuYi(ctx, L, T, R, B, color)
      break

    case 'gui-jiao':
      drawGuiJiao(ctx, L, T, R, B, color)
      break

    case 'chan-zhi':
      drawChanZhi(ctx, L, T, R, B, color)
      break

    case 'yun-lei':
      drawYunLei(ctx, L, T, R, B, color)
      break
  }

  ctx.globalAlpha = 1.0
}

/** 回纹：连续方折回旋（商周青铜器经典纹样） */
function drawHuiWen(
  ctx: CanvasRenderingContext2D,
  L: number, T: number, R: number, B: number, color: string,
): void {
  ctx.globalAlpha = 0.2
  ctx.lineWidth = 1.5
  ctx.strokeStyle = color

  const s = 16
  const drawUnit = (x: number, y: number, dir: number) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + s * dir, y)
    ctx.lineTo(x + s * dir, y + s)
    ctx.lineTo(x + s * 0.3 * dir, y + s)
    ctx.lineTo(x + s * 0.3 * dir, y + s * 0.4)
    ctx.lineTo(x + s * 0.7 * dir, y + s * 0.4)
    ctx.lineTo(x + s * 0.7 * dir, y + s * 0.7)
    ctx.stroke()
  }

  for (let x = L; x < R - s; x += s * 1.2) {
    drawUnit(x, T - s * 0.5, 1)
    drawUnit(x, B - s * 0.5, 1)
  }
  for (let y = T; y < B - s; y += s * 1.2) {
    ctx.save()
    ctx.translate(L - s * 0.5, y)
    ctx.rotate(Math.PI / 2)
    drawUnit(0, 0, 1)
    ctx.restore()
    ctx.save()
    ctx.translate(R + s * 0.5, y)
    ctx.rotate(Math.PI / 2)
    drawUnit(0, 0, 1)
    ctx.restore()
  }
}

/** 万字纹：卍字连续排列 */
function drawWanZi(
  ctx: CanvasRenderingContext2D,
  L: number, T: number, R: number, B: number, color: string,
): void {
  ctx.globalAlpha = 0.18
  ctx.lineWidth = 1.2
  ctx.strokeStyle = color

  const s = 14
  const drawWan = (cx: number, cy: number) => {
    const h = s * 0.5
    ctx.beginPath()
    ctx.moveTo(cx - h, cy); ctx.lineTo(cx + h, cy)
    ctx.moveTo(cx, cy - h); ctx.lineTo(cx, cy + h)
    ctx.moveTo(cx + h, cy); ctx.lineTo(cx + h, cy - h); ctx.lineTo(cx + h * 0.3, cy - h)
    ctx.moveTo(cx - h, cy); ctx.lineTo(cx - h, cy + h); ctx.lineTo(cx - h * 0.3, cy + h)
    ctx.moveTo(cx, cy - h); ctx.lineTo(cx + h, cy - h + h * 0.3)
    ctx.moveTo(cx, cy + h); ctx.lineTo(cx - h, cy + h - h * 0.3)
    ctx.stroke()
  }

  for (let x = L; x <= R; x += s * 2) {
    drawWan(x, T)
    drawWan(x, B)
  }
  for (let y = T + s * 2; y <= B - s * 2; y += s * 2) {
    drawWan(L, y)
    drawWan(R, y)
  }
}

/** 如意纹：四角如意云头 */
function drawRuYi(
  ctx: CanvasRenderingContext2D,
  L: number, T: number, R: number, B: number, color: string,
): void {
  ctx.globalAlpha = 0.12
  ctx.lineWidth = 1
  ctx.strokeRect(L, T, R - L, B - T)

  ctx.globalAlpha = 0.22
  ctx.lineWidth = 2
  ctx.strokeStyle = color

  const sz = 35
  const corners = [
    { cx: L, cy: T, sx: 1, sy: 1 },
    { cx: R, cy: T, sx: -1, sy: 1 },
    { cx: R, cy: B, sx: -1, sy: -1 },
    { cx: L, cy: B, sx: 1, sy: -1 },
  ]

  for (const { cx, cy, sx, sy } of corners) {
    ctx.beginPath()
    ctx.moveTo(cx + sx * sz * 1.2, cy)
    ctx.quadraticCurveTo(cx + sx * sz * 0.8, cy + sy * sz * 0.15, cx + sx * sz * 0.5, cy + sy * sz * 0.5)
    ctx.quadraticCurveTo(cx + sx * sz * 0.15, cy + sy * sz * 0.8, cx, cy + sy * sz * 1.2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx + sx * sz * 0.4, cy + sy * sz * 0.4, sz * 0.25, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx + sx * sz * 0.15, cy + sy * sz * 0.7, sz * 0.12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + sx * sz * 0.7, cy + sy * sz * 0.15, sz * 0.12, 0, Math.PI * 2)
    ctx.stroke()
  }
}

/** 圭角：L 型方折转角（古代玉圭形制） */
function drawGuiJiao(
  ctx: CanvasRenderingContext2D,
  L: number, T: number, R: number, B: number, color: string,
): void {
  const len = 55
  const w = 4
  ctx.globalAlpha = 0.22
  ctx.fillStyle = color

  const corners = [
    { x: L, y: T, dx: 1, dy: 1 },
    { x: R, y: T, dx: -1, dy: 1 },
    { x: R, y: B, dx: -1, dy: -1 },
    { x: L, y: B, dx: 1, dy: -1 },
  ]

  for (const { x, y, dx, dy } of corners) {
    ctx.fillRect(x, y, dx * len, dy * w)
    ctx.fillRect(x, y, dx * w, dy * len)
    ctx.fillRect(x + dx * 8, y + dy * 8, dx * (len - 16), dy * 1.5)
    ctx.fillRect(x + dx * 8, y + dy * 8, dx * 1.5, dy * (len - 16))
  }
}

/** 缠枝纹：枝蔓缠绕连续纹样 */
function drawChanZhi(
  ctx: CanvasRenderingContext2D,
  L: number, T: number, R: number, B: number, color: string,
): void {
  ctx.globalAlpha = 0.15
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2

  const amp = 12
  const freq = 0.06

  const drawVine = (x1: number, y1: number, x2: number, y2: number, isHoriz: boolean) => {
    ctx.beginPath()
    const dist = isHoriz ? x2 - x1 : y2 - y1
    const steps = Math.abs(dist)
    for (let i = 0; i <= steps; i += 2) {
      const t = i / steps
      const px = isHoriz ? x1 + i : x1 + Math.sin(i * freq) * amp
      const py = isHoriz ? y1 + Math.sin(i * freq) * amp : y1 + i
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()

    const leafCount = Math.floor(Math.abs(dist) / 80)
    ctx.globalAlpha = 0.1
    for (let i = 0; i < leafCount; i++) {
      const t = (i + 0.5) / leafCount
      const pos = Math.abs(dist) * t
      const lx = isHoriz ? x1 + pos : x1 + Math.sin(pos * freq) * amp
      const ly = isHoriz ? y1 + Math.sin(pos * freq) * amp : y1 + pos
      ctx.beginPath()
      ctx.ellipse(lx, ly, 6, 3, isHoriz ? Math.PI * 0.3 : Math.PI * 0.8, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 0.15
  }

  drawVine(L, T, R, T, true)
  drawVine(L, B, R, B, true)
  drawVine(L, T, L, B, false)
  drawVine(R, T, R, B, false)
}

/** 云雷纹：圆弧回旋（青铜器经典纹） */
function drawYunLei(
  ctx: CanvasRenderingContext2D,
  L: number, T: number, R: number, B: number, color: string,
): void {
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5

  const s = 20

  const drawSpiral = (cx: number, cy: number) => {
    ctx.beginPath()
    const turns = 1.5
    for (let a = 0; a < turns * Math.PI * 2; a += 0.15) {
      const r = 2 + a * 1.5
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      if (a === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  for (let x = L; x <= R; x += s * 1.5) {
    drawSpiral(x, T)
    drawSpiral(x, B)
  }
  for (let y = T + s * 1.5; y <= B - s; y += s * 1.5) {
    drawSpiral(L, y)
    drawSpiral(R, y)
  }
}

/** 正文布局信息 */
interface PoemLayout {
  startX: number
  startY: number
  fontSize: number
  colSpacing: number
  charSpacing: number
  numCols: number
  maxChars: number
  /** 正文最左列的 X 坐标 */
  leftEdgeX: number
  /** 正文底部 Y 坐标 */
  bottomY: number
}

/** 竖排绘制诗词正文，返回布局信息供落款使用 */
function drawVerticalPoem(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  lines: string[],
  fontFamily: string,
  color: string,
  fontScale: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0,
  colSpacingScale: number = 1.0,
  charSpacingScale: number = 1.0,
): PoemLayout {
  const cleanLines = lines.map(l => l.replace(/[，。；！？、,\.;!\?]/g, '').trim())
  const maxChars = Math.max(...cleanLines.map(l => [...l].length))
  const numCols = cleanLines.length

  // 左右多留白给落款区域
  const availW = W - 200
  const availH = H - 200

  const baseFontSize = Math.min(
    Math.floor(availW / ((numCols + 1.5) * 1.8)),
    Math.floor(availH / (maxChars * 1.5)),
    72,
  )

  const fontSize = Math.floor(baseFontSize * fontScale)
  const colSpacing = fontSize * 1.8 * colSpacingScale
  const charSpacing = fontSize * 1.4 * charSpacingScale

  const totalW = numCols * colSpacing
  const totalH = maxChars * charSpacing

  // 正文稍偏右，给左侧留出落款空间
  const startX = W / 2 + totalW / 2 - colSpacing / 2 + fontSize * 0.5 + offsetX
  const startY = (H - totalH) / 2 + fontSize / 2 - 10 + offsetY

  ctx.fillStyle = color
  ctx.font = `${fontSize}px "${fontFamily}", "Ma Shan Zheng", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let col = 0; col < numCols; col++) {
    const chars = [...cleanLines[col]]
    const x = startX - col * colSpacing
    for (let row = 0; row < chars.length; row++) {
      const y = startY + row * charSpacing
      ctx.fillText(chars[row], x, y)
    }
  }

  const leftEdgeX = startX - (numCols - 1) * colSpacing - colSpacing
  const bottomY = startY + (maxChars - 1) * charSpacing

  return { startX, startY, fontSize, colSpacing, charSpacing, numCols, maxChars, leftEdgeX, bottomY }
}

/** 公历年份转干支纪年 */
function toGanZhi(year: number): string {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const idx = year - 4
  return `${gan[idx % 10]}${zhi[idx % 12]}`
}

/** 公历月份转传统时令 */
function toSeasonMonth(month: number): string {
  const names: Record<number, string> = {
    0: '孟春', 1: '仲春', 2: '季春',
    3: '孟夏', 4: '仲夏', 5: '季夏',
    6: '孟秋', 7: '仲秋', 8: '季秋',
    9: '孟冬', 10: '仲冬', 11: '季冬',
  }
  return names[month] ?? '仲秋'
}

/** 生成传统落款文字行（每个 string 是一「列」竖排文字） */
function buildColophonLines(
  title: string,
  calligrapher: string,
  verb: string,
  showDate: boolean,
  layout: 'auto' | 'single' | 'multi' = 'auto',
): string[] {
  const datePart = showDate
    ? `${toGanZhi(new Date().getFullYear())}年${toSeasonMonth(new Date().getMonth())}`
    : ''
  const namePart = `${calligrapher}${verb}`

  // 合并后的总字数，用于 auto 判断
  const mergedLen = datePart.length + namePart.length
  const useSingle = layout === 'single' || (layout === 'auto' && mergedLen <= 8)

  const lines: string[] = []

  // 第一列：诗题
  lines.push(title)

  if (useSingle) {
    // 时间 + 姓名合为一列
    lines.push(`${datePart}${namePart}`)
  } else {
    // 分列
    if (datePart) lines.push(datePart)
    lines.push(namePart)
  }

  return lines
}

/** 绘制传统落款（竖排在正文左侧，从右往左排列多列） */
function drawColophon(
  ctx: CanvasRenderingContext2D,
  _W: number, _H: number,
  poemLayout: PoemLayout,
  lines: string[],
  color: string,
  fontFamily: string,
  ox: number = 0,
  oy: number = 0,
): number {
  const { leftEdgeX, bottomY, fontSize, charSpacing } = poemLayout

  const colophonFontSize = Math.max(Math.floor(fontSize * 0.35), 14)
  const cCharSpacing = colophonFontSize * 1.5
  const cColSpacing = colophonFontSize * 1.8

  const poemTopY = poemLayout.startY - charSpacing * 0.5
  const startY = poemTopY + (bottomY - poemTopY) * 0.45 + oy

  ctx.fillStyle = color
  ctx.globalAlpha = 0.7
  ctx.font = `${colophonFontSize}px "${fontFamily}", "Ma Shan Zheng", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let colX = leftEdgeX + ox

  for (let ci = 0; ci < lines.length; ci++) {
    const chars = [...lines[ci]]
    let curY = startY
    for (const ch of chars) {
      ctx.fillText(ch, colX, curY)
      curY += cCharSpacing
    }
    colX -= cColSpacing
  }

  ctx.globalAlpha = 1.0
  return colX + cColSpacing
}

/** 计算印章坐标 */
function getStampCoords(
  W: number, H: number,
  position: StampPosition,
): { x: number; y: number } {
  const padX = 120
  const padY = 200

  switch (position) {
    case 'bottom-right':
      return { x: W - padX, y: H - padY }
    case 'top-right':
      return { x: W - padX, y: padY }
    case 'top-left':
      return { x: padX, y: padY }
    case 'bottom-left':
    default:
      return { x: padX, y: H - padY }
  }
}

/** 绘制印章（模拟真实钤印效果） */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  text: string,
  color: string,
  position: StampPosition = 'bottom-left',
  fontFamily: string = 'XiaoZhuan, "STXinwei", serif',
  freeX?: number,
  freeY?: number,
  size?: number,
  shape?: string,
): void {
  const stampSize = size ?? 56
  const stampShape = shape ?? 'square'
  const { x, y } = (freeX !== undefined && freeY !== undefined)
    ? { x: freeX * W, y: freeY * H }
    : getStampCoords(W, H, position)

  ctx.save()
  const half = stampSize / 2

  // 用离屏 canvas 绘制印章，再叠加斑驳纹理
  const offW = stampSize + 20
  const offH = stampSize + 20
  const off = document.createElement('canvas')
  off.width = offW
  off.height = offH
  const oc = off.getContext('2d')!
  const cx = offW / 2
  const cy = offH / 2

  oc.fillStyle = color
  oc.strokeStyle = color

  // ── 绘制外框（带微抖动模拟刀刻痕迹） ──
  oc.lineWidth = 2.5
  const drawWobblyPath = (points: Array<[number, number]>, closed = true) => {
    oc.beginPath()
    const segs = 40
    for (let i = 0; i < points.length; i++) {
      const [ax, ay] = points[i]
      const [bx, by] = points[(i + 1) % points.length]
      if (!closed && i === points.length - 1) break
      for (let j = 0; j <= segs; j++) {
        const t = j / segs
        const px = ax + (bx - ax) * t + (Math.random() - 0.5) * 1.2
        const py = ay + (by - ay) * t + (Math.random() - 0.5) * 1.2
        if (i === 0 && j === 0) oc.moveTo(px, py)
        else oc.lineTo(px, py)
      }
    }
    if (closed) oc.closePath()
    oc.stroke()
  }

  const drawWobblyArc = (cx: number, cy: number, rx: number, ry: number) => {
    oc.beginPath()
    const segs = 60
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2
      const jx = (Math.random() - 0.5) * 1.2
      const jy = (Math.random() - 0.5) * 1.2
      const px = cx + Math.cos(a) * rx + jx
      const py = cy + Math.sin(a) * ry + jy
      if (i === 0) oc.moveTo(px, py)
      else oc.lineTo(px, py)
    }
    oc.closePath()
    oc.stroke()
  }

  switch (stampShape) {
    case 'round': {
      const charCount = [...text].length
      const r = charCount <= 2 ? half * 1.15 : half * 1.1
      drawWobblyArc(cx, cy, r, r)
      break
    }
    case 'oval': {
      const charCount = [...text].length
      const rx = charCount === 2 ? half * 0.7 : half * 0.85
      const ry = charCount === 2 ? half * 1.2 : half * 1.1
      drawWobblyArc(cx, cy, rx, ry)
      break
    }
    default: {
      const charCount = [...text].length
      const hw = charCount === 2 ? half * 0.65 : half * 1.02
      const hh = charCount === 2 ? half * 1.15 : half * 1.02
      drawWobblyPath([
        [cx - hw, cy - hh], [cx + hw, cy - hh],
        [cx + hw, cy + hh], [cx - hw, cy + hh],
      ])
      break
    }
  }

  // ── 印章内文字 ──
  oc.fillStyle = color
  oc.textAlign = 'center'
  oc.textBaseline = 'middle'

  const chars = [...text].slice(0, 4)
  if (chars.length === 1) {
    oc.font = `bold ${stampSize * 0.78}px ${fontFamily}`
    oc.fillText(chars[0], cx, cy)
  } else if (chars.length === 2) {
    oc.font = `bold ${stampSize * 0.64}px ${fontFamily}`
    const s = stampSize * 0.24
    oc.fillText(chars[0], cx, cy - s)
    oc.fillText(chars[1], cx, cy + s)
  } else {
    oc.font = `bold ${stampSize * 0.52}px ${fontFamily}`
    const s = stampSize * 0.22
    if (chars[0]) oc.fillText(chars[0], cx - s, cy - s)
    if (chars[1]) oc.fillText(chars[1], cx + s, cy - s)
    if (chars[2]) oc.fillText(chars[2], cx - s, cy + s)
    if (chars[3]) oc.fillText(chars[3], cx + s, cy + s)
  }

  // ── 斑驳效果：随机擦除一些像素模拟印泥不均 ──
  const imgData = oc.getImageData(0, 0, offW, offH)
  const d = imgData.data
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] > 0) {
      // 边缘区域更容易斑驳
      const px = ((i / 4) % offW) - cx
      const py = Math.floor((i / 4) / offW) - cy
      const dist = Math.sqrt(px * px + py * py) / half
      const edgeFade = dist > 0.75 ? 0.3 : 0.08
      if (Math.random() < edgeFade) {
        d[i] = 0 // 擦除
      } else {
        // 轻微透明度变化
        d[i] = Math.max(0, d[i] - Math.floor(Math.random() * 40))
      }
    }
  }
  oc.putImageData(imgData, 0, 0)

  // ── 贴到主 canvas ──
  ctx.globalAlpha = 0.88
  ctx.drawImage(off, x - cx, y - cy)
  ctx.restore()
}

/** 绘制水印（极淡，底部居中） */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
): void {
  ctx.fillStyle = '#000'
  ctx.globalAlpha = 0.05
  ctx.font = '12px "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('moyun.art', W / 2, H - 15)
  ctx.globalAlpha = 1.0
}
