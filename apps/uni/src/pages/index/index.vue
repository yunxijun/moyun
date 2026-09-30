<template>
  <view class="page">
    <!-- 沉浸式头部 -->
    <view class="hero">
      <view class="hero-bg">
        <view class="mountain mountain-far" />
        <view class="mountain mountain-mid" />
        <view class="mountain mountain-near" />
        <view class="mist mist-1" />
        <view class="mist mist-2" />
      </view>
      <view class="ink-floats">
        <view v-for="i in 5" :key="i" class="ink-dot" :class="`dot-${i}`" />
      </view>
      <view class="hero-content">
        <view class="logo-vertical">
          <text class="logo-char">墨</text>
          <text class="logo-char">韵</text>
        </view>
        <text class="subtitle">AI诗词·书法</text>
      </view>
    </view>

    <!-- 今日诗签 — 悬挂式书签（可拖拽） -->
    <view
      class="daily-bookmark"
      :style="bookmarkStyle"
      @mousedown.prevent="onBookmarkDragStart"
      @touchstart.prevent="onBookmarkDragStart"
    >
      <view class="bookmark-pin">
        <view class="pin-head" />
      </view>
      <view class="bookmark-body" ref="bookmarkBodyRef" @tap="onDailyCardTap">
        <view class="daily-seal">签</view>
        <text class="daily-label">今日诗签</text>
        <view class="daily-poem-wrap">
          <text class="daily-poem">「{{ dailyPoem }}」</text>
        </view>
        <view class="bookmark-tassel" />
      </view>
    </view>

    <!-- 内容约束容器 -->
    <view class="content-wrap">

    <!-- 双入口模式切换 -->
    <view class="mode-section">
      <view class="mode-switch">
        <view class="mode-tab" :class="{ active: mode === 'create' }" @tap="mode = 'create'">
          <text class="mode-tab-mark">创</text>
          <text class="mode-tab-label">AI赋诗</text>
        </view>
        <view class="mode-divider" />
        <view class="mode-tab" :class="{ active: mode === 'classic' }" @tap="mode = 'classic'">
          <text class="mode-tab-mark">典</text>
          <text class="mode-tab-label">经典重现</text>
        </view>
        <view class="mode-divider" />
        <view class="mode-tab" :class="{ active: mode === 'custom' }" @tap="mode = 'custom'">
          <text class="mode-tab-mark">书</text>
          <text class="mode-tab-label">自由书写</text>
        </view>
      </view>
      <text class="mode-desc">{{ mode === 'create' ? '输入主题，AI为你创作古典诗词' : mode === 'classic' ? '粘贴诗词原文，AI识别后生成书法' : '输入任意文字，生成书法作品' }}</text>
    </view>

    <!-- ═══ AI赋诗 模式 ═══ -->
    <template v-if="mode === 'create'">
      <!-- 快捷主题标签 -->
      <view class="tags">
        <view
          v-for="tag in quickTags"
          :key="tag.value"
          class="tag"
          :class="{ active: selectedTag === tag.value }"
          @tap="onSelectTag(tag.value)"
        >
          <view v-if="selectedTag === tag.value" class="tag-ink" />
          <text class="tag-text">{{ tag.label }}</text>
        </view>
      </view>

      <view class="ink-divider" />

      <!-- 信笺输入 -->
      <view class="input-section">
        <view class="letter-paper">
          <view class="letter-margin" />
          <view class="letter-margin-right" />
          <view class="letter-watermark">笺</view>
          <textarea
            v-model="userInput"
            class="input-area"
            placeholder="输入你的心情、场景或主题..."
            :maxlength="200"
            auto-height
          />
          <view class="letter-lines">
            <view v-for="n in 4" :key="n" class="letter-line" />
          </view>
        </view>

        <!-- 图片上传 -->
        <view class="image-upload">
          <view
            v-for="(img, idx) in uploadedImages"
            :key="idx"
            class="image-preview"
          >
            <image :src="img" mode="aspectFill" class="preview-img" @tap="onPreviewImage(idx)" />
            <view class="remove-btn" @tap.stop="removeImage(idx)">×</view>
          </view>
          <view
            v-if="uploadedImages.length < 3"
            class="add-image"
            @tap="onChooseImage"
          >
            <view class="add-icon-seal">
              <text class="add-icon">＋</text>
            </view>
            <text class="add-text">以图赋诗</text>
          </view>
        </view>
      </view>

      <!-- 体裁 / 风格 -->
      <view class="options">
        <view class="option-wrap">
          <view class="option-item" @tap="showGenrePanel = !showGenrePanel; showStylePanel = false">
            <text class="option-dot"></text>
            <text class="option-label-mark">体</text>
            <text class="option-label">体裁</text>
            <text class="option-value">{{ selectedGenre || '不限' }}</text>
            <view class="option-arrow" :class="{ open: showGenrePanel }" />
          </view>
          <view v-if="showGenrePanel" class="dropdown-panel">
            <view
              v-for="g in genres"
              :key="g"
              class="dropdown-item"
              :class="{ active: (g === '自动' && !selectedGenre) || g === selectedGenre }"
              @tap="selectedGenre = g === '自动' ? '' : g; showGenrePanel = false"
            >
              <text class="dropdown-text">{{ g }}</text>
            </view>
          </view>
        </view>
        <view class="option-wrap">
          <view class="option-item" @tap="showStylePanel = !showStylePanel; showGenrePanel = false">
            <text class="option-dot"></text>
            <text class="option-label-mark">风</text>
            <text class="option-label">风格</text>
            <text class="option-value">{{ selectedStyle || '不限' }}</text>
            <view class="option-arrow" :class="{ open: showStylePanel }" />
          </view>
          <view v-if="showStylePanel" class="dropdown-panel">
            <view
              v-for="s in styles"
              :key="s"
              class="dropdown-item"
              :class="{ active: (s === '自动' && !selectedStyle) || s === selectedStyle }"
              @tap="selectedStyle = s === '自动' ? '' : s; showStylePanel = false"
            >
              <text class="dropdown-text">{{ s }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 生成按钮 - 印章风格 -->
      <view class="generate-wrap">
        <view class="seal-halo" :class="{ pulsing: !loading }" />
        <view class="seal-ripple" :class="{ pulsing: !loading }" />
        <view class="generate-seal" :class="{ active: loading }" @tap="onGenerate">
          <view class="seal-border">
            <view class="seal-inner">
              <text class="seal-char">{{ loading ? '挥' : '落' }}</text>
              <text class="seal-char">{{ loading ? '毫' : '笔' }}</text>
              <text class="seal-char">{{ loading ? '中' : '成' }}</text>
              <text class="seal-char">{{ loading ? '…' : '诗' }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- ═══ 经典重现 模式 ═══ -->
    <template v-if="mode === 'classic'">
      <!-- 名篇速选（快捷填入） -->
      <view class="classic-chips">
        <view
          v-for="p in classicPresets"
          :key="p.title"
          class="classic-chip"
          :class="{ active: classicInput === p.content }"
          @tap="classicInput = p.content"
        >
          <text class="classic-chip-title">{{ p.title }}</text>
          <text class="classic-chip-dot">·</text>
          <text class="classic-chip-author">{{ p.author }}</text>
        </view>
      </view>

      <view class="ink-divider" />

      <!-- 输入区 -->
      <view class="input-section">
        <view class="letter-paper classic-paper">
          <view class="letter-margin" />
          <view class="letter-margin-right" />
          <view class="letter-watermark">诗</view>
          <textarea
            v-model="classicInput"
            class="input-area classic-input"
            placeholder="粘贴或输入一首诗词…&#10;&#10;如：床前明月光，疑是地上霜。&#10;举头望明月，低头思故乡。"
            :maxlength="1000"
            auto-height
          />
          <view class="letter-lines">
            <view v-for="n in 6" :key="n" class="letter-line" />
          </view>
        </view>
      </view>

      <!-- 识别按钮 -->
      <view class="generate-wrap">
        <view class="seal-halo" :class="{ pulsing: !loading }" />
        <view class="seal-ripple" :class="{ pulsing: !loading }" />
        <view class="generate-seal" :class="{ active: loading }" @tap="onIdentify">
          <view class="seal-border">
            <view class="seal-inner">
              <text class="seal-char">{{ loading ? '识' : '挥' }}</text>
              <text class="seal-char">{{ loading ? '别' : '毫' }}</text>
              <text class="seal-char">{{ loading ? '中' : '泼' }}</text>
              <text class="seal-char">{{ loading ? '…' : '墨' }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- ═══ 自由书写 模式 ═══ -->
    <template v-if="mode === 'custom'">
      <view class="ink-divider" />

      <!-- 标题输入 -->
      <view class="input-section">
        <view class="letter-paper">
          <view class="letter-margin" />
          <view class="letter-margin-right" />
          <view class="letter-watermark">题</view>
          <textarea
            v-model="customTitle"
            class="input-area"
            placeholder="作品标题（可选）"
            :maxlength="30"
            auto-height
            :style="{ minHeight: '40px' }"
          />
        </view>
      </view>

      <!-- 正文输入 -->
      <view class="input-section">
        <view class="letter-paper classic-paper">
          <view class="letter-margin" />
          <view class="letter-margin-right" />
          <view class="letter-watermark">文</view>
          <textarea
            v-model="customContent"
            class="input-area classic-input"
            placeholder="输入你想书写的文字…&#10;&#10;可以是诗词、名言、座右铭、&#10;祝福语、歌词，或任何文字。&#10;&#10;每行一句，会按行分列排版。"
            :maxlength="2000"
            auto-height
          />
          <view class="letter-lines">
            <view v-for="n in 8" :key="n" class="letter-line" />
          </view>
        </view>
      </view>

      <!-- 译文/说明（可选） -->
      <view class="input-section">
        <view class="letter-paper">
          <view class="letter-margin" />
          <view class="letter-margin-right" />
          <view class="letter-watermark">注</view>
          <textarea
            v-model="customNote"
            class="input-area"
            placeholder="补充说明或译文（可选）"
            :maxlength="500"
            auto-height
            :style="{ minHeight: '40px' }"
          />
        </view>
      </view>

      <!-- 生成按钮 -->
      <view class="generate-wrap">
        <view class="seal-halo" :class="{ pulsing: true }" />
        <view class="seal-ripple" :class="{ pulsing: true }" />
        <view class="generate-seal" @tap="onCustomGenerate">
          <view class="seal-border">
            <view class="seal-inner">
              <text class="seal-char">挥</text>
              <text class="seal-char">毫</text>
              <text class="seal-char">泼</text>
              <text class="seal-char">墨</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    </view><!-- /.content-wrap -->

    <!-- 今日剩余（沉底） -->
    <view v-if="quotaRemaining >= 0" class="quota-hint">
      <view class="quota-line" />
      <text class="quota-text">今日剩余 {{ quotaRemaining }}/{{ quotaLimit }} 次</text>
      <view class="quota-line" />
    </view>

    <!-- 浮动导航 -->
    <FloatingNav />

    <!-- 流式生成遮罩 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-paper">
        <view class="loading-ink-drops">
          <view class="ink-drop" v-for="i in 3" :key="i" :class="`drop-${i}`" />
        </view>
        <view class="loading-title-wrap">
          <text class="loading-title-char">挥</text>
          <text class="loading-title-char">毫</text>
          <text class="loading-title-char">中</text>
        </view>
        <text v-if="streamingDone" class="loading-done">创作完成</text>
        <scroll-view scroll-y class="stream-output">
          <view class="stream-vertical">
            <text class="stream-text">{{ streamingText || '正在构思...' }}</text>
            <text v-if="!streamingDone" class="cursor-blink">|</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FloatingNav from '../../components/FloatingNav.vue'
import { API_BASE_URL } from '../../utils/api'

const dailyPoem = ref('山高月小，水落石出')

// ========== 诗签书签：自由摆动 + 可拖拽 ==========
const bookmarkBodyRef = ref<any>(null)
let bookmarkAngle = 0
let bookmarkVelocity = 0
let bookmarkTime = 0
let bookmarkRafId = 0

// 书签位置（px）
const BOOKMARK_STORAGE_KEY = 'moyun_bookmark_pos'
const bookmarkPos = ref({ x: -1, y: 80 }) // x=-1 表示未初始化，用默认右侧位置
let isDraggingBookmark = false
let dragOffsetX = 0
let dragOffsetY = 0

// hero 区域限制
const HERO_MIN_Y = 20
const HERO_MAX_Y = 240 // ~540rpx 的一半多一点

// 滚动吸附：hero 内跟随，滚出后 fixed
const scrollY = ref(0)
const STICKY_TOP = 12 // 吸附到顶部时的偏移(px)

function onScroll() {
  scrollY.value = window.scrollY || document.documentElement.scrollTop
}

const isMobile = ref(false)

const bookmarkStyle = computed(() => {
  // 手机端由 CSS 控制位置（fixed 右上角）
  if (isMobile.value) return {}

  const posY = bookmarkPos.value.y
  const isSticky = scrollY.value > posY - STICKY_TOP

  if (bookmarkPos.value.x < 0) {
    return isSticky
      ? { position: 'fixed', top: `${STICKY_TOP}px`, right: 'clamp(16px, 4vw, 60px)' }
      : { position: 'absolute', top: `${posY}px`, right: 'clamp(16px, 4vw, 60px)' }
  }
  return isSticky
    ? { position: 'fixed', top: `${STICKY_TOP}px`, left: `${bookmarkPos.value.x}px`, right: 'auto' }
    : { position: 'absolute', top: `${posY}px`, left: `${bookmarkPos.value.x}px`, right: 'auto' }
})

function loadBookmarkPos() {
  try {
    const saved = uni.getStorageSync(BOOKMARK_STORAGE_KEY)
    if (saved) {
      const p = JSON.parse(saved)
      if (typeof p.x === 'number' && typeof p.y === 'number') {
        bookmarkPos.value = p
      }
    }
  } catch {}
}

function saveBookmarkPos() {
  uni.setStorageSync(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkPos.value))
}

function onBookmarkDragStart(e: MouseEvent | TouchEvent) {
  // 手机端不允许拖拽（空间太小）
  if (window.innerWidth <= 768) return
  isDraggingBookmark = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  // 如果是默认位置（right 定位），先转换为 left 定位
  if (bookmarkPos.value.x < 0) {
    bookmarkPos.value.x = window.innerWidth - 72 - 30 // 书签宽度 + 右边距估算
  }

  dragOffsetX = clientX - bookmarkPos.value.x
  dragOffsetY = clientY - bookmarkPos.value.y

  document.addEventListener('mousemove', onBookmarkDragMove)
  document.addEventListener('mouseup', onBookmarkDragEnd)
  document.addEventListener('touchmove', onBookmarkDragMove, { passive: false })
  document.addEventListener('touchend', onBookmarkDragEnd)
}

/** 计算内容区的左右边界（书签不能进入的区域） */
function getContentBounds() {
  const vw = window.innerWidth
  const contentW = Math.min(680, vw - 40) // content-wrap max-width + padding
  const contentLeft = (vw - contentW) / 2
  const contentRight = contentLeft + contentW
  return { contentLeft, contentRight }
}

/** 将 x 吸附到内容区两侧 */
function snapToMargin(rawX: number): number {
  const bookmarkW = 72
  const { contentLeft, contentRight } = getContentBounds()
  const margin = 8 // 与内容区的最小间距

  const leftZoneMax = contentLeft - bookmarkW - margin
  const rightZoneMin = contentRight + margin

  // 如果屏幕太窄没有侧边空间，就贴到右边
  if (leftZoneMax < 0 && rightZoneMin > window.innerWidth - bookmarkW) {
    return window.innerWidth - bookmarkW - 8
  }

  // 判断拖拽位置更靠近左侧还是右侧
  const midpoint = (contentLeft + contentRight) / 2
  if (rawX + bookmarkW / 2 < midpoint) {
    // 吸附左侧
    return Math.max(0, Math.min(leftZoneMax, rawX))
  } else {
    // 吸附右侧
    return Math.min(window.innerWidth - bookmarkW, Math.max(rightZoneMin, rawX))
  }
}

function onBookmarkDragMove(e: MouseEvent | TouchEvent) {
  if (!isDraggingBookmark) return
  if ('touches' in e) e.preventDefault()

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  const rawX = clientX - dragOffsetX
  const x = snapToMargin(rawX)
  const y = Math.max(HERO_MIN_Y, Math.min(HERO_MAX_Y, clientY - dragOffsetY))

  bookmarkPos.value = { x, y }
}

function onBookmarkDragEnd() {
  isDraggingBookmark = false
  saveBookmarkPos()
  document.removeEventListener('mousemove', onBookmarkDragMove)
  document.removeEventListener('mouseup', onBookmarkDragEnd)
  document.removeEventListener('touchmove', onBookmarkDragMove)
  document.removeEventListener('touchend', onBookmarkDragEnd)
}

// 摆动动画
function animateBookmark() {
  bookmarkTime += 0.016

  const windMain = Math.sin(bookmarkTime * 0.8) * 3.5
  const windGust = Math.sin(bookmarkTime * 2.1 + 1.3) * 1.2
  const windBreath = Math.sin(bookmarkTime * 0.3 + 0.7) * 0.8
  // 拖拽中增大振幅
  const dragBoost = isDraggingBookmark ? 4 : 0
  const targetAngle = windMain + windGust + windBreath + dragBoost

  const force = (targetAngle - bookmarkAngle) * 0.02
  bookmarkVelocity = (bookmarkVelocity + force) * 0.92
  bookmarkAngle += bookmarkVelocity

  const bodyEl = bookmarkBodyRef.value?.$el || bookmarkBodyRef.value
  if (bodyEl) {
    bodyEl.style.transform = `rotate(${bookmarkAngle.toFixed(2)}deg)`
  }
  bookmarkRafId = requestAnimationFrame(animateBookmark)
}

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadBookmarkPos()
  bookmarkRafId = requestAnimationFrame(animateBookmark)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  cancelAnimationFrame(bookmarkRafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', checkMobile)
})

// ========== 访客 ID ==========
function getVisitorId(): string {
  let id = uni.getStorageSync('moyun_visitor_id')
  if (!id) {
    id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    uni.setStorageSync('moyun_visitor_id', id)
  }
  return id
}

// ========== 配额 ==========
const quotaRemaining = ref(-1)
const quotaLimit = ref(10)

async function fetchQuota() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/poem/quota`, {
      headers: { 'x-visitor-id': getVisitorId() },
    })
    const data = await resp.json()
    if (data.success) {
      quotaRemaining.value = data.data.remaining
      quotaLimit.value = data.data.limit
    }
  } catch (_) {}
}

// 页面加载时查询配额
onMounted(() => fetchQuota())

// ========== 流式生成 ==========
const streamingText = ref('')
const streamingDone = ref(false)

const mode = ref<'create' | 'classic' | 'custom'>('create')
const classicInput = ref('')
const customTitle = ref('')
const customContent = ref('')
const customNote = ref('')

const classicPresets = [
  { title: '静夜思', author: '李白', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
  { title: '春晓', author: '孟浩然', content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。' },
  { title: '登鹳雀楼', author: '王之涣', content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
  { title: '望庐山瀑布', author: '李白', content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。' },
  { title: '水调歌头', author: '苏轼', content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。' },
  { title: '将进酒', author: '李白', content: '君不见黄河之水天上来，奔流到海不复回。君不见高堂明镜悲白发，朝如青丝暮成雪。' },
]

const quickTags = [
  { label: '山水', value: '写景' },
  { label: '咏怀', value: '抒情' },
  { label: '节令', value: '节气' },
  { label: '望月', value: '思乡' },
  { label: '离别', value: '送别' },
  { label: '佳节', value: '节日' },
  { label: '相思', value: '爱情' },
  { label: '壮志', value: '壮志' },
]

const genres = ['自动', '五言绝句', '七言绝句', '五言律诗', '七言律诗', '词', '对联']
const styles = ['自动', '豪放', '婉约', '田园', '边塞', '清新', '古朴']

const selectedTag = ref('')
const userInput = ref('')
const selectedGenre = ref('')
const selectedStyle = ref('')
const showGenrePanel = ref(false)
const showStylePanel = ref(false)
const uploadedImages = ref<string[]>([])
const loading = ref(false)

function onSelectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  if (selectedTag.value && !userInput.value) {
    userInput.value = tag
  }
}

// 点击页面其他区域关闭下拉
function closeDropdowns() {
  showGenrePanel.value = false
  showStylePanel.value = false
}

function onChooseImage() {
  uni.chooseImage({
    count: 3 - uploadedImages.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadedImages.value.push(...res.tempFilePaths)
    },
  })
}

function removeImage(idx: number) {
  uploadedImages.value.splice(idx, 1)
}

function onPreviewImage(idx: number) {
  uni.previewImage({
    current: uploadedImages.value[idx],
    urls: uploadedImages.value,
  })
}

function fileToBase64(filePath: string): Promise<string> {
  // #ifdef H5
  return fetch(filePath)
    .then((res) => res.blob())
    .then((blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
  // #endif
  // #ifndef H5
  return new Promise<string>((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => resolve(`data:image/jpeg;base64,${res.data}`),
      fail: reject,
    })
  })
  // #endif
}

function onDailyCardTap() {
  // TODO: 展示今日诗签详情
}

async function onGenerate() {
  if (loading.value) return
  if (!userInput.value.trim() && uploadedImages.value.length === 0) {
    uni.showToast({ title: '请输入主题或上传照片', icon: 'none' })
    return
  }

  loading.value = true
  streamingText.value = ''
  streamingDone.value = false

  try {
    const hasImages = uploadedImages.value.length > 0

    if (hasImages) {
      // 图片转 base64 data URL 后发送
      const base64Urls = await Promise.all(
        uploadedImages.value.map((path) => fileToBase64(path))
      )
      const { api } = await import('../../utils/api')
      const result = await api.poemFromImage({
        imageUrls: base64Urls,
        text: userInput.value || undefined,
        genre: (selectedGenre.value || undefined) as any,
        style: (selectedStyle.value || undefined) as any,
      })
      loading.value = false
      if (result.success && result.data) {
        uni.setStorageSync('moyun_nav_poem', JSON.stringify(result.data))
        uni.setStorageSync('moyun_nav_input', JSON.stringify({
          prompt: userInput.value,
          genre: selectedGenre.value,
          style: selectedStyle.value,
          images: uploadedImages.value,
        }))
        uni.navigateTo({ url: '/pages/result/result?from=storage' })
      } else {
        uni.showToast({ title: result.error?.message || '生成失败', icon: 'none' })
      }
      return
    }

    // 文字作诗 —— 流式
    const resp = await fetch(`${API_BASE_URL}/api/poem/generate-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-visitor-id': getVisitorId(),
      },
      body: JSON.stringify({
        prompt: userInput.value,
        genre: selectedGenre.value || undefined,
        style: selectedStyle.value || undefined,
      }),
    })

    if (!resp.ok) {
      if (resp.status === 429) {
        const errData = await resp.json()
        loading.value = false
        uni.showToast({ title: errData.error?.message || '今日次数已用完', icon: 'none', duration: 3000 })
        return
      }
      throw new Error('请求失败')
    }
    if (!resp.body) throw new Error('无响应体')

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    let gotDone = false

    function handleSSELine(line: string) {
      if (!line.startsWith('data: ')) return
      const jsonStr = line.slice(6).trim()
      if (!jsonStr) return

      try {
        const evt = JSON.parse(jsonStr)
        if (evt.type === 'token') {
          streamingText.value += evt.content
        } else if (evt.type === 'done') {
          gotDone = true
          streamingDone.value = true
          if (evt.quota) {
            quotaRemaining.value = evt.quota.remaining
          }
          setTimeout(() => {
            loading.value = false
            uni.setStorageSync('moyun_nav_poem', JSON.stringify(evt.poem))
            uni.setStorageSync('moyun_nav_input', JSON.stringify({
              prompt: userInput.value,
              genre: selectedGenre.value,
              style: selectedStyle.value,
              images: uploadedImages.value,
            }))
            uni.navigateTo({ url: '/pages/result/result?from=storage' })
          }, 800)
        } else if (evt.type === 'error') {
          gotDone = true
          loading.value = false
          uni.showToast({ title: evt.message, icon: 'none' })
        }
      } catch (_) {}
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) handleSSELine(line)
    }

    // 流结束后处理 buffer 中残留的最后一条消息
    if (buffer.trim()) handleSSELine(buffer.trim())

    if (!gotDone) {
      loading.value = false
      uni.showToast({ title: '生成异常，请重试', icon: 'none' })
    }
  } catch (err) {
    loading.value = false
    uni.showToast({ title: '网络异常，请重试', icon: 'none' })
  }
}

/** 经典诗词识别 */
async function onIdentify() {
  if (loading.value) return
  if (!classicInput.value.trim()) {
    uni.showToast({ title: '请输入或粘贴诗词', icon: 'none' })
    return
  }

  loading.value = true
  streamingText.value = ''
  streamingDone.value = false

  try {
    const resp = await fetch(`${API_BASE_URL}/api/poem/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-visitor-id': getVisitorId(),
      },
      body: JSON.stringify({ text: classicInput.value }),
    })

    if (!resp.ok) {
      if (resp.status === 429) {
        const errData = await resp.json()
        loading.value = false
        uni.showToast({ title: errData.error?.message || '今日次数已用完', icon: 'none', duration: 3000 })
        return
      }
      throw new Error('请求失败')
    }

    const data = await resp.json()
    loading.value = false

    if (data.success && data.data) {
      uni.setStorageSync('moyun_nav_poem', JSON.stringify(data.data))
      uni.setStorageSync('moyun_nav_input', JSON.stringify({
        prompt: classicInput.value,
        mode: 'classic',
      }))
      uni.navigateTo({ url: '/pages/result/result?from=storage' })
    } else {
      uni.showToast({ title: data.error?.message || '识别失败', icon: 'none' })
    }
  } catch (err) {
    loading.value = false
    uni.showToast({ title: '网络异常，请重试', icon: 'none' })
  }
}

/** 自由书写：直接组装数据跳转，无需 API 调用 */
function onCustomGenerate() {
  const text = customContent.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入要书写的文字', icon: 'none' })
    return
  }

  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean)
  const title = customTitle.value.trim() || '自由书写'

  const poemData = {
    title,
    genre: '自由',
    content: lines,
    translation: customNote.value.trim() || '',
    appreciation: '',
  }

  uni.setStorageSync('moyun_nav_poem', JSON.stringify(poemData))
  uni.setStorageSync('moyun_nav_input', JSON.stringify({
    prompt: text,
    mode: 'custom',
  }))
  uni.navigateTo({ url: '/pages/result/result?from=storage' })
}
</script>

<style lang="scss">
@import '@fontsource/ma-shan-zheng';

// ── 色彩变量 ──
$paper: var(--c-paper);
$ink: var(--c-ink);
$cinnabar: var(--c-vermilion);
$mountain: var(--c-mountain);
$gold: var(--c-gold);
$ink-light: var(--c-ink-08);
$ink-faint: rgba(26, 26, 46, 0.04);

.page {
  min-height: 100vh;
  background-color: var(--c-paper);
  padding: 0;
  position: relative;
  overflow-x: hidden;

  // 页面底层水墨晕染 —— 从 hero 向下延伸的淡墨雾气
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1200rpx;
    background:
      radial-gradient(ellipse 80% 40% at 50% 200rpx, rgba(91, 127, 149, 0.08), transparent),
      radial-gradient(ellipse 60% 30% at 20% 500rpx, rgba(91, 127, 149, 0.04), transparent),
      radial-gradient(ellipse 50% 25% at 80% 600rpx, rgba(139, 115, 85, 0.03), transparent);
    pointer-events: none;
    z-index: 0;
  }
}

// 内容容器 — 约束最大宽度，居中
.content-wrap {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 40rpx;
  position: relative;
  z-index: 1;
}

// ══════════════════════════════════════
//  沉浸式头部
// ══════════════════════════════════════
.hero {
  position: relative;
  height: 540rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.hero-bg {
  position: absolute;
  inset: 0;
  bottom: -80rpx; // 向下延伸
  background: linear-gradient(
    180deg,
    $paper 0%,
    rgba(250, 248, 243, 0.9) 20%,
    rgba(91, 127, 149, 0.15) 55%,
    rgba(91, 127, 149, 0.28) 80%,
    rgba(91, 127, 149, 0.12) 95%,
    transparent 100%
  );
}

.mountain {
  position: absolute;
  bottom: -40rpx;
  width: 100%;
  border-radius: 50% 50% 0 0;

  &-far {
    height: 220rpx;
    background: linear-gradient(180deg, transparent 10%, rgba(91, 127, 149, 0.2));
    transform: scaleX(1.8);
    bottom: 80rpx;
    animation: mountainReveal 2s ease-out forwards;
  }

  &-mid {
    height: 170rpx;
    background: linear-gradient(180deg, transparent 10%, rgba(91, 127, 149, 0.35));
    transform: scaleX(1.4);
    bottom: 30rpx;
    animation: mountainReveal 2.4s ease-out 0.3s forwards;
    opacity: 0;
  }

  &-near {
    height: 120rpx;
    background: linear-gradient(180deg, transparent 10%, rgba(26, 26, 46, 0.12));
    transform: scaleX(1.15);
    animation: mountainReveal 2.8s ease-out 0.6s forwards;
    opacity: 0;
  }
}

.mist {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(250, 248, 243, 0.85), transparent);
  animation: mistDrift 8s ease-in-out infinite;

  &-1 {
    width: 400rpx;
    height: 80rpx;
    bottom: 110rpx;
    left: 5%;
    animation-delay: 0s;
  }

  &-2 {
    width: 500rpx;
    height: 70rpx;
    bottom: 60rpx;
    right: 0%;
    animation-delay: -4s;
  }
}

@keyframes mountainReveal {
  from { opacity: 0; transform: scaleX(1.6) translateY(20rpx); }
  to { opacity: 1; transform: scaleX(1.6) translateY(0); }
}

@keyframes mistDrift {
  0%, 100% { transform: translateX(0); opacity: 0.6; }
  50% { transform: translateX(40rpx); opacity: 0.9; }
}

.ink-floats {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ink-dot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--c-ink-12), transparent 70%);
  animation: inkFloat 12s ease-in-out infinite;

  &.dot-1 { width: 80rpx; height: 80rpx; top: 15%; left: 12%; animation-delay: 0s; }
  &.dot-2 { width: 50rpx; height: 50rpx; top: 30%; right: 18%; animation-delay: -3s; }
  &.dot-3 { width: 100rpx; height: 100rpx; top: 55%; left: 8%; animation-delay: -6s; }
  &.dot-4 { width: 40rpx; height: 40rpx; top: 20%; right: 35%; animation-delay: -2s; }
  &.dot-5 { width: 60rpx; height: 60rpx; top: 65%; right: 10%; animation-delay: -8s; }
}

@keyframes inkFloat {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  33% { transform: translate(20rpx, -30rpx) scale(1.1); opacity: 0.7; }
  66% { transform: translate(-15rpx, 20rpx) scale(0.9); opacity: 0.5; }
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
}

.logo-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.logo-char {
  font-family: var(--ui-font);
  font-size: 108rpx;
  color: $ink;
  line-height: 1;
  letter-spacing: 0;
  text-shadow: 0 4rpx 20rpx var(--c-ink-15);
}

.subtitle {
  margin-top: 28rpx;
  font-size: 22rpx;
  color: $mountain;
  letter-spacing: 16rpx;
  opacity: 0.75;
  position: relative;

  // 副标题两侧的装饰线
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 60rpx;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, $mountain, transparent);
    opacity: 0.3;
  }
  &::before { right: calc(100% + 16rpx); }
  &::after { left: calc(100% + 16rpx); }
}

// ══════════════════════════════════════
//  今日诗签 — 悬挂式书签
// ══════════════════════════════════════
.daily-bookmark {
  // position 由 JS bookmarkStyle 动态设置（absolute ↔ fixed）
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: grab;
  user-select: none;
  // 拖拽结束吸附时的平滑过渡
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              top 0.15s ease,
              filter 0.2s ease;

  &:active {
    cursor: grabbing;
    filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.15));
    transition: filter 0.2s ease; // 拖拽中不要位置过渡
  }
}

// 钉子/别针
.bookmark-pin {
  position: relative;
  z-index: 2;
  width: 12px;
  height: 12px;
}

.pin-head {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #d4a574, #8b5e3c 60%, #5c3a1e);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

// 书签主体
.bookmark-body {
  cursor: inherit;
  transform-origin: top center;
  will-change: transform;
  // 初始微倾
  transform: rotate(-1deg);

  position: relative;
  width: 72px;
  margin-top: -3px;
  padding: 28px 12px 20px;
  background:
    linear-gradient(180deg,
      #faf6ee 0%,
      #f5efe0 30%,
      #ede5d2 80%,
      #e8dfc8 100%);
  border: 1px solid rgba(139, 115, 85, 0.15);
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow:
    2px 4px 16px rgba(26, 26, 46, 0.08),
    inset 0 0 30px rgba(250, 248, 243, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s ease;

  // 顶部折角阴影
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 12px;
    background: linear-gradient(180deg, rgba(139, 115, 85, 0.06), transparent);
    pointer-events: none;
  }

  &:hover {
    box-shadow:
      3px 6px 24px rgba(26, 26, 46, 0.12),
      inset 0 0 30px rgba(250, 248, 243, 0.4);
  }
}

.daily-seal {
  width: 28px;
  height: 28px;
  border: 1.5px solid $cinnabar;
  color: $cinnabar;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  opacity: 0.75;
  margin-bottom: 12px;
  transform: rotate(5deg);
}

.daily-label {
  font-size: 10px;
  color: $mountain;
  letter-spacing: 3px;
  writing-mode: vertical-rl;
  margin-bottom: 10px;
  opacity: 0.6;
}

.daily-poem-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
}

.daily-poem {
  font-family: var(--ui-font);
  font-size: 18px;
  color: $ink;
  writing-mode: vertical-rl;
  letter-spacing: 5px;
  line-height: 1.6;
}

// 书签底部流苏
.bookmark-tassel {
  width: 2px;
  height: 36px;
  margin-top: 8px;
  position: relative;
  background: linear-gradient(180deg, $cinnabar, rgba(199, 62, 29, 0.3));
  border-radius: 0 0 2px 2px;

  &::before, &::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 8px;
    height: 14px;
    border-radius: 0 0 4px 4px;
  }

  &::before {
    left: -5px;
    background: linear-gradient(180deg, rgba(199, 62, 29, 0.5), rgba(199, 62, 29, 0.1));
    transform: rotate(-8deg);
  }

  &::after {
    right: -5px;
    background: linear-gradient(180deg, rgba(199, 62, 29, 0.5), rgba(199, 62, 29, 0.1));
    transform: rotate(8deg);
  }
}

// ══════════════════════════════════════
//  双入口模式切换
// ══════════════════════════════════════
.mode-section {
  margin-top: 40rpx;
  margin-bottom: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: 0;
  background: linear-gradient(180deg, rgba(255,254,249,0.8), rgba(245,240,230,0.5));
  border: 1rpx solid var(--c-border);
  border-radius: 12rpx;
  padding: 6rpx;
  position: relative;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 18rpx 36rpx;
  border-radius: 8rpx;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &.active {
    background: $ink;
    box-shadow: 0 4rpx 16rpx var(--c-ink-15);

    .mode-tab-mark {
      color: $cinnabar;
      opacity: 1;
    }
    .mode-tab-label {
      color: rgba(250, 248, 243, 0.95);
    }
  }

  &:not(.active):hover {
    background: rgba(26, 26, 46, 0.04);
  }
}

.mode-tab-mark {
  font-family: var(--ui-font);
  font-size: 34rpx;
  color: $mountain;
  opacity: 0.5;
  line-height: 1;
}

.mode-tab-label {
  font-size: 24rpx;
  color: $mountain;
  letter-spacing: 4rpx;
  white-space: nowrap;
}

.mode-divider {
  width: 1rpx;
  height: 36rpx;
  background: var(--c-ink-12);
  flex-shrink: 0;
}

.mode-desc {
  margin-top: 16rpx;
  font-size: 22rpx;
  color: $mountain;
  opacity: 0.6;
  letter-spacing: 2rpx;
}

// ══════════════════════════════════════
//  通用区域
// ══════════════════════════════════════
.section-head {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.section-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, $ink-light, transparent);
}

.section-title {
  font-size: 26rpx;
  color: $mountain;
  letter-spacing: 8rpx;
  white-space: nowrap;
}

// 水墨药丸标签
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  justify-content: center;
  margin-bottom: 8rpx;
}

.tag {
  position: relative;
  overflow: hidden;
  background: rgba(255, 254, 249, 0.75);
  border: 1rpx solid rgba(91, 127, 149, 0.12);
  border-radius: 999rpx;
  backdrop-filter: blur(8px);
  padding: 14rpx 28rpx;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 8rpx 24rpx var(--c-ink-08);
    border-color: rgba(91, 127, 149, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: $ink;
    border-color: $ink;

    .tag-text {
      color: $paper;
    }

    .tag-ink {
      animation: inkSpread 0.5s ease-out forwards;
    }
  }
}

.tag-ink {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 70%);
  transform: scale(0);
  border-radius: 999rpx;
}

@keyframes inkSpread {
  from { transform: scale(0); opacity: 1; }
  to { transform: scale(2.5); opacity: 0; }
}

.tag-text {
  position: relative;
  z-index: 1;
  font-family: var(--ui-font);
  font-size: 28rpx;
  color: var(--c-ink-75);
  letter-spacing: 4rpx;
}

// 水墨渐隐分隔
.ink-divider {
  height: 2rpx;
  margin: 40rpx 60rpx 0;
  background: linear-gradient(90deg, transparent, var(--c-ink-12), rgba(91, 127, 149, 0.15), var(--c-ink-12), transparent);
  border-radius: 2rpx;
}

// 信笺输入
.input-section {
  margin-top: 40rpx;
}

.letter-paper {
  position: relative;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3rpx,
      rgba(139, 115, 85, 0.02) 3rpx,
      rgba(139, 115, 85, 0.02) 4rpx
    ),
    linear-gradient(180deg, #fffef8, #f8f2e8);
  border: 1rpx solid rgba(139, 115, 85, 0.12);
  border-radius: 8rpx;
  padding: 32rpx 56rpx 48rpx 48rpx;
  min-height: 200rpx;
  box-shadow: 0 4rpx 20rpx rgba(139, 115, 85, 0.06);
  transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;

  &:focus-within {
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3rpx,
        rgba(139, 115, 85, 0.02) 3rpx,
        rgba(139, 115, 85, 0.02) 4rpx
      ),
      linear-gradient(180deg, #fffef8, #f5ede0);
    border-color: rgba(91, 127, 149, 0.25);
    box-shadow: 0 8rpx 32rpx rgba(139, 115, 85, 0.08);
  }
}

.letter-margin {
  position: absolute;
  left: 28rpx;
  top: 24rpx;
  bottom: 24rpx;
  width: 3rpx;
  background: linear-gradient(180deg, transparent, rgba(199, 62, 29, 0.35), transparent);
}

.letter-margin-right {
  position: absolute;
  right: 28rpx;
  top: 24rpx;
  bottom: 24rpx;
  width: 2rpx;
  background: linear-gradient(180deg, transparent, rgba(26, 26, 46, 0.14), transparent);
}

.letter-watermark {
  position: absolute;
  right: 52rpx;
  bottom: 20rpx;
  font-family: var(--ui-font);
  font-size: 56rpx;
  color: rgba(26, 26, 46, 0.045);
  line-height: 1;
  pointer-events: none;
  z-index: 0;
  transform: rotate(-8deg);
}

.input-area {
  width: 100%;
  min-height: 120rpx;
  font-size: 28rpx;
  color: $ink;
  line-height: 2;
  box-sizing: border-box;
  background: transparent;
  position: relative;
  z-index: 1;
  border: none;
  outline: none;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
  box-shadow: none;
}

.letter-lines {
  position: absolute;
  left: 48rpx;
  right: 32rpx;
  bottom: 32rpx;
  top: 80rpx;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.letter-line {
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--c-ink-06) 15%,
    var(--c-ink-12) 50%,
    var(--c-ink-06) 85%,
    transparent 100%
  );
}

// 图片上传
.image-upload {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
  flex-wrap: wrap;
}

.image-preview {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  padding: 4rpx;
}

.preview-img {
  width: 100%;
  height: 100%;
  border: 1rpx solid var(--c-border);
  clip-path: polygon(
    1% 2%,
    96% 0%,
    100% 4%,
    99% 94%,
    95% 100%,
    3% 98%,
    0% 92%,
    2% 6%
  );
  border-radius: 6rpx 10rpx 8rpx 12rpx;
  box-shadow: 2rpx 4rpx 12rpx var(--c-ink-06);
}

.remove-btn {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 32rpx;
  height: 32rpx;
  background: var(--c-paper);
  color: $cinnabar;
  border: 2rpx solid rgba(199, 62, 29, 0.75);
  border-radius: 4rpx;
  text-align: center;
  line-height: 28rpx;
  font-size: 22rpx;
  font-family: var(--ui-font);
  box-shadow: 0 2rpx 6rpx rgba(199, 62, 29, 0.2);
  transform: rotate(6deg);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:active {
    transform: rotate(6deg) scale(0.92);
  }
}

.add-image {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background:
    radial-gradient(ellipse at center, rgba(250, 248, 243, 0.9), rgba(245, 240, 230, 0.5));
  transition: background 0.35s ease, box-shadow 0.35s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8rpx;
    border: 3rpx dashed rgba(91, 127, 149, 0.28);
    pointer-events: none;
  }

  &:hover,
  &:active {
    background:
      radial-gradient(ellipse at center, var(--c-ink-06), transparent 72%),
      radial-gradient(ellipse at center, rgba(250, 248, 243, 0.95), rgba(245, 240, 230, 0.6));
    box-shadow: inset 0 0 40rpx rgba(26, 26, 46, 0.04);
  }
}

.add-icon-seal {
  width: 52rpx;
  height: 52rpx;
  border: 2rpx solid rgba(91, 127, 149, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(250, 248, 243, 0.6);
  box-shadow: inset 0 0 12rpx rgba(26, 26, 46, 0.04);
}

.add-icon {
  font-family: var(--ui-font);
  font-size: 36rpx;
  color: $mountain;
  opacity: 0.55;
  line-height: 1;
}

.add-text {
  font-size: 20rpx;
  color: $mountain;
  letter-spacing: 2rpx;
}

// ══════════════════════════════════════
//  经典重现模式
// ══════════════════════════════════════
.classic-paper {
  min-height: 320rpx;
}

.classic-input {
  min-height: 240rpx;
  line-height: 2.2;
}

.classic-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 8rpx;
}

.classic-chip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 14rpx 28rpx;
  background: rgba(255, 255, 255, 0.6);
  border: 1rpx solid rgba(26, 26, 46, 0.1);
  border-radius: 999rpx;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(199, 62, 29, 0.2);
    background: rgba(199, 62, 29, 0.04);
  }

  &.active {
    background: $ink;
    border-color: $ink;
    .classic-chip-title { color: $paper; }
    .classic-chip-dot { color: rgba(250, 248, 243, 0.4); }
    .classic-chip-author { color: rgba(250, 248, 243, 0.6); }
  }

  &:active { transform: scale(0.96); }
}

.classic-chip-title {
  font-family: var(--ui-font);
  font-size: 26rpx;
  color: var(--c-ink-75);
  letter-spacing: 2rpx;
}

.classic-chip-dot {
  font-size: 18rpx;
  color: $mountain;
  opacity: 0.3;
}

.classic-chip-author {
  font-size: 20rpx;
  color: $mountain;
  opacity: 0.5;
}

// ══════════════════════════════════════
//  体裁 / 风格选择器
// ══════════════════════════════════════
.options {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.option-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: linear-gradient(180deg, #fffef8, #f5ede0);
  border: 1rpx solid rgba(139, 115, 85, 0.1);
  border-radius: 8rpx;
  padding: 20rpx 18rpx;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(180deg, #fffef8, #f0e8d8);
    border-color: rgba(91, 127, 149, 0.2);
    box-shadow: 0 3rpx 12rpx rgba(139, 115, 85, 0.06);
    transform: translateY(-2rpx);
  }
}

.option-wrap {
  flex: 1;
  position: relative;
}

.option-dot {
  display: none;
}

.option-label-mark {
  font-family: var(--ui-font);
  font-size: 30rpx;
  color: $cinnabar;
  opacity: 0.6;
  line-height: 1;
  flex-shrink: 0;
  margin-right: -2rpx;
}

.option-label {
  font-size: 22rpx;
  color: $mountain;
  white-space: nowrap;
}

.option-value {
  flex: 1;
  font-size: 24rpx;
  color: $ink;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8rpx 0 8rpx 12rpx;
  border-color: transparent transparent transparent rgba(26, 26, 46, 0.32);
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 4rpx;

  &.open {
    transform: rotate(90deg);
  }
}

// 自定义下拉面板
.dropdown-panel {
  position: absolute;
  top: calc(100% + 8rpx);
  left: 0;
  right: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3rpx,
      rgba(26, 26, 46, 0.015) 3rpx,
      rgba(26, 26, 46, 0.015) 4rpx
    ),
    linear-gradient(180deg, var(--c-paper), var(--c-paper-deep));
  border: 1rpx solid rgba(26, 26, 46, 0.1);
  border-top: 3rpx solid rgba(199, 62, 29, 0.5);
  border-radius: 8rpx;
  padding: 16rpx 0;
  box-shadow: 0 10rpx 32rpx var(--c-ink-08);
  z-index: 100;
  animation: dropdownIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 14rpx;
    left: 14rpx;
    width: 22rpx;
    height: 22rpx;
    border-top: 2rpx solid rgba(199, 62, 29, 0.4);
    border-left: 2rpx solid rgba(199, 62, 29, 0.4);
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 14rpx;
    right: 14rpx;
    width: 22rpx;
    height: 22rpx;
    border-bottom: 2rpx solid rgba(199, 62, 29, 0.4);
    border-right: 2rpx solid rgba(199, 62, 29, 0.4);
    pointer-events: none;
    z-index: 1;
  }
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-8rpx) scaleY(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

.dropdown-item {
  position: relative;
  padding: 20rpx 28rpx 20rpx 44rpx;
  transition: background 0.2s ease;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 20rpx;
    right: 20rpx;
    bottom: 0;
    height: 1rpx;
    background: linear-gradient(
      90deg,
      transparent,
      var(--c-ink-06) 20%,
      var(--c-ink-08) 50%,
      var(--c-ink-06) 80%,
      transparent
    );
  }

  &:hover {
    background: rgba(91, 127, 149, 0.05);
  }

  &:active {
    background: rgba(26, 26, 46, 0.04);
  }

  &.active {
    background: rgba(199, 62, 29, 0.04);

    .dropdown-text {
      color: $cinnabar;
      font-family: var(--ui-font);
    }

    &::before {
      content: '';
      position: absolute;
      left: 18rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 14rpx;
      height: 14rpx;
      background: $cinnabar;
      border-radius: 2rpx;
      opacity: 0.85;
      box-shadow: 0 1rpx 3rpx rgba(199, 62, 29, 0.3);
    }
  }
}

.dropdown-text {
  font-size: 26rpx;
  color: $ink;
  letter-spacing: 4rpx;
  text-align: center;
  display: block;
}

// ══════════════════════════════════════
//  生成按钮 — 印章风格
// ══════════════════════════════════════
.generate-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 56rpx;
  height: 240rpx;
}

.seal-halo {
  position: absolute;
  width: 240rpx;
  height: 240rpx;
  border-radius: 12rpx;
  border: 2rpx solid rgba(199, 62, 29, 0.08);
  transform: rotate(45deg);

  &.pulsing {
    animation: sealHaloPulse 4s ease-in-out infinite;
  }
}

.seal-ripple {
  position: absolute;
  width: 280rpx;
  height: 280rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(199, 62, 29, 0.05);
  transform: rotate(45deg);

  &.pulsing {
    animation: sealHaloPulse 4s ease-in-out 1s infinite;
  }
}

@keyframes sealHaloPulse {
  0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.6; }
  50% { transform: rotate(45deg) scale(1.15); opacity: 0; }
}

.generate-seal {
  position: relative;
  z-index: 2;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease;

  &:hover {
    transform: scale(1.05) rotate(-1deg);

    .seal-border {
      box-shadow:
        0 12rpx 48rpx rgba(199, 62, 29, 0.25),
        inset 0 0 40rpx rgba(199, 62, 29, 0.08);
    }
  }

  &:active {
    transform: scale(0.95) rotate(1deg);
  }

  &.active {
    .seal-border {
      animation: sealPress 2s ease-in-out infinite;
    }
  }
}

@keyframes sealPress {
  0%, 100% {
    box-shadow: 0 8rpx 32rpx rgba(199, 62, 29, 0.15);
  }
  50% {
    box-shadow: 0 8rpx 32rpx rgba(199, 62, 29, 0.15),
                0 0 0 16rpx rgba(199, 62, 29, 0.04);
  }
}

.seal-border {
  width: 180rpx;
  height: 180rpx;
  border: 5rpx solid $cinnabar;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-paper);
  box-shadow: 0 8rpx 32rpx rgba(199, 62, 29, 0.15);
  transition: box-shadow 0.3s ease;
}

.seal-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4rpx;
  width: 130rpx;
  height: 130rpx;
  align-items: center;
  justify-items: center;
}

.seal-char {
  font-family: var(--ui-font);
  font-size: 52rpx;
  color: $cinnabar;
  line-height: 1;
  text-align: center;
}

.quota-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 40rpx 60rpx 120rpx;
}

.quota-line {
  flex: 1;
  max-width: 120rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, var(--c-ink-12), transparent);
}

.quota-text {
  font-family: var(--ui-font);
  font-size: 22rpx;
  color: rgba(91, 127, 149, 0.75);
  letter-spacing: 4rpx;
  white-space: nowrap;
}

// ══════════════════════════════════════
//  流式生成遮罩
// ══════════════════════════════════════
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-overlay);
  backdrop-filter: blur(12px) saturate(1.1);
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-paper {
  position: relative;
  width: 560rpx;
  max-height: 75vh;
  margin: 18rpx 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 4rpx,
      rgba(26, 26, 46, 0.018) 4rpx,
      rgba(26, 26, 46, 0.018) 5rpx
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 40rpx,
      rgba(139, 94, 60, 0.02) 40rpx,
      rgba(139, 94, 60, 0.02) 41rpx
    ),
    linear-gradient(
      180deg,
      #f5efe0 0%,
      #ede5d2 8%,
      var(--c-paper) 50%,
      #ede5d2 92%,
      #f5efe0 100%
    );
  border-left: 1rpx solid var(--c-border);
  border-right: 1rpx solid var(--c-border);
  border-radius: 0;
  padding: 40rpx 40rpx 48rpx;
  box-shadow:
    2rpx 0 12rpx rgba(26, 26, 46, 0.04),
    -2rpx 0 12rpx rgba(26, 26, 46, 0.04),
    0 16rpx 48rpx var(--c-ink-08);
  display: flex;
  flex-direction: column;
  align-items: center;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: -16rpx;
    right: -16rpx;
    height: 18rpx;
    border-radius: 9rpx;
    background: linear-gradient(180deg, #8b5e3c 0%, #5c3a1e 40%, #8b5e3c 100%);
    box-shadow:
      0 3rpx 10rpx rgba(0, 0, 0, 0.15),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
    z-index: 2;
  }

  &::before {
    top: -9rpx;
  }

  &::after {
    bottom: -9rpx;
  }
}

.loading-ink-drops {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.ink-drop {
  width: 14rpx;
  height: 14rpx;
  background: $ink;
  border-radius: 50%;
  animation: inkBounce 1.4s ease-in-out infinite;
}

.drop-1 { animation-delay: 0s; }
.drop-2 { animation-delay: 0.2s; }
.drop-3 { animation-delay: 0.4s; }

@keyframes inkBounce {
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
  40% { transform: scale(1.3); opacity: 1; }
}

.loading-title-wrap {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.loading-title-char {
  font-family: var(--ui-font);
  font-size: 40rpx;
  color: $ink;
  writing-mode: vertical-rl;
  letter-spacing: 4rpx;
  animation: charFade 2s ease-in-out infinite;

  &:nth-child(2) { animation-delay: 0.3s; }
  &:nth-child(3) { animation-delay: 0.6s; }
}

@keyframes charFade {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.loading-done {
  font-size: 22rpx;
  color: $cinnabar;
  letter-spacing: 6rpx;
  margin-bottom: 24rpx;
}

.stream-output {
  width: 100%;
  max-height: 50vh;
  background: rgba(26, 26, 46, 0.02);
  border: 1rpx solid var(--c-ink-06);
  padding: 32rpx 24rpx;
}

.stream-vertical {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  gap: 8rpx;
  min-height: 120rpx;
}

.stream-text {
  font-family: var(--ui-font);
  font-size: 28rpx;
  color: $ink;
  writing-mode: vertical-rl;
  letter-spacing: 6rpx;
  line-height: 1.8;
  max-height: 45vh;
  word-break: break-all;
  white-space: pre-wrap;
}

.cursor-blink {
  color: $cinnabar;
  font-weight: bold;
  writing-mode: vertical-rl;
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ══════════════════════════════════════
   深色模式覆盖（夜墨风）
   ══════════════════════════════════════ */
:root[data-theme="dark"] {
  .page {
    background-color: var(--c-paper);
    &::before {
      background:
        radial-gradient(ellipse 80% 40% at 50% 200rpx, rgba(20, 50, 70, 0.3), transparent),
        radial-gradient(ellipse 60% 30% at 20% 500rpx, rgba(20, 40, 55, 0.15), transparent),
        radial-gradient(ellipse 50% 25% at 80% 600rpx, rgba(30, 25, 20, 0.1), transparent) !important;
    }
  }

  /* 头部英雄区 — 月夜山水 */
  .hero-bg {
    background: linear-gradient(180deg, #0e1520 0%, #12202e 25%, #1a2838 55%, #162030 80%, transparent 100%) !important;
  }
  .mountain-far { background: rgba(20, 40, 55, 0.7) !important; }
  .mountain-mid { background: rgba(15, 30, 45, 0.6) !important; }
  .mountain-near { background: rgba(25, 45, 60, 0.8) !important; }
  .mist {
    background: radial-gradient(ellipse, rgba(180, 200, 220, 0.08), transparent) !important;
  }
  .ink-dot { opacity: 0.3; }

  /* 标题和副标题 */
  .logo-char { color: #f0ece6 !important; }
  .subtitle { color: rgba(122, 168, 194, 0.7) !important; }

  /* 悬挂书签 — 暗夜纸感 */
  .bookmark-body {
    background: linear-gradient(180deg, #2a2a3a 0%, #222230 50%, #1e1e2e 100%) !important;
    border-color: rgba(232, 228, 223, 0.08) !important;
    box-shadow: 2px 4px 20px rgba(0, 0, 0, 0.35) !important;
    &::before { background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent) !important; }
  }
  .pin-head {
    background: radial-gradient(circle at 40% 35%, #8b7355, #5c3a1e 60%, #3a2510) !important;
  }
  .daily-seal { color: var(--c-vermilion); }
  .daily-label { color: rgba(232, 228, 223, 0.4); }
  .daily-poem { color: rgba(232, 228, 223, 0.75) !important; }
  .bookmark-tassel { background: linear-gradient(180deg, var(--c-vermilion), rgba(224, 96, 64, 0.2)) !important; }

  /* 快捷标签 — 墨色水墨签 */
  .tag {
    background: rgba(232, 228, 223, 0.06) !important;
    border-color: rgba(232, 228, 223, 0.1) !important;

    .tag-text { color: rgba(232, 228, 223, 0.55) !important; }

    &:hover, &.active {
      background: rgba(224, 96, 64, 0.12) !important;
      border-color: rgba(224, 96, 64, 0.3) !important;

      .tag-text { color: var(--c-vermilion) !important; }
    }
  }

  /* 「开始创作」标题 */
  .section-title { color: var(--c-ink) !important; }
  .section-line { background: rgba(232, 228, 223, 0.08) !important; }

  /* 水墨分隔线 */
  .ink-divider {
    background: linear-gradient(90deg, transparent, rgba(232, 228, 223, 0.08), rgba(122, 168, 194, 0.1), rgba(232, 228, 223, 0.08), transparent) !important;
  }

  /* 信笺输入区 */
  .letter-paper {
    background: #222230 !important;
    border-color: rgba(232, 228, 223, 0.08) !important;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2) !important;
  }
  .letter-line {
    background: linear-gradient(90deg, transparent, rgba(232, 228, 223, 0.06), transparent) !important;
  }
  .letter-margin-left {
    background: rgba(224, 96, 64, 0.2) !important;
  }
  .letter-margin-right {
    background: rgba(232, 228, 223, 0.06) !important;
  }
  .letter-watermark {
    color: rgba(232, 228, 223, 0.04) !important;
  }
  .letter-input {
    color: var(--c-ink) !important;
    &::placeholder { color: rgba(232, 228, 223, 0.25) !important; }
  }

  /* 图片上传 */
  .add-image {
    border-color: rgba(232, 228, 223, 0.12) !important;
    background: rgba(232, 228, 223, 0.03);
  }
  .image-preview {
    background: #222230;
  }

  /* 选择器（题材/风格） */
  .option-item {
    background: #222230 !important;
    background-image: none !important;
    border-color: rgba(232, 228, 223, 0.08) !important;
    color: var(--c-ink);
  }
  .option-text { color: var(--c-ink); }
  .option-arrow { color: rgba(232, 228, 223, 0.3) !important; }

  /* 下拉面板 */
  .dropdown-panel {
    background: #2a2a3a !important;
    background-image: none !important;
    border-color: rgba(232, 228, 223, 0.1) !important;
  }
  .dropdown-item {
    color: var(--c-ink);
    border-bottom-color: rgba(232, 228, 223, 0.05) !important;
  }
  .dropdown-item.active {
    background: rgba(224, 96, 64, 0.1);
  }
  .dropdown-overlay {
    background: rgba(0, 0, 0, 0.5);
  }

  /* 生成按钮 */
  .seal-border {
    border-color: var(--c-vermilion);
    background: rgba(224, 96, 64, 0.08);
  }

  /* 剩余次数 */
  .quota-hint { color: rgba(232, 228, 223, 0.4); }
  .quota-line { background: rgba(232, 228, 223, 0.08) !important; }

  /* 加载遮罩 */
  .loading-overlay {
    background: rgba(18, 18, 26, 0.5);
    backdrop-filter: blur(16px) saturate(1.1);
  }
  .loading-paper {
    background: linear-gradient(180deg, #2a2a3a, #222230 50%, #2a2a3a) !important;
    border-color: rgba(232, 228, 223, 0.06) !important;
  }
  .stream-text { color: var(--c-ink); }

  /* 模式切换 */
  .mode-switch {
    background: rgba(30, 30, 50, 0.7) !important;
    border-color: rgba(232, 228, 223, 0.12) !important;
  }
  .mode-tab.active {
    background: rgba(224, 96, 64, 0.2) !important;
    box-shadow: 0 2rpx 12rpx rgba(224, 96, 64, 0.15) !important;
  }
  .mode-tab-mark { color: rgba(232, 228, 223, 0.35) !important; }
  .mode-tab.active .mode-tab-mark { color: var(--c-vermilion) !important; opacity: 1 !important; }
  .mode-tab-label { color: rgba(232, 228, 223, 0.45) !important; }
  .mode-tab.active .mode-tab-label { color: rgba(232, 228, 223, 0.95) !important; }
  .mode-divider { background: rgba(232, 228, 223, 0.1) !important; }
  .mode-desc { color: rgba(232, 228, 223, 0.3); }

  /* 经典模式 */
  .classic-chip {
    background: rgba(232, 228, 223, 0.06) !important;
    border-color: rgba(232, 228, 223, 0.1) !important;

    .classic-chip-title { color: rgba(232, 228, 223, 0.55) !important; }
    .classic-chip-dot { color: rgba(232, 228, 223, 0.2) !important; }
    .classic-chip-author { color: rgba(232, 228, 223, 0.35) !important; }

    &:hover, &.active {
      background: rgba(224, 96, 64, 0.12) !important;
      border-color: rgba(224, 96, 64, 0.3) !important;
      .classic-chip-title { color: var(--c-vermilion) !important; }
      .classic-chip-author { color: rgba(232, 228, 223, 0.6) !important; }
    }
  }
}

/* ══════════════════════════════════════
   移动端适配（≤ 768px）
   ══════════════════════════════════════ */
@media (max-width: 768px) {
  // 书签：手机上缩小并固定在右上角
  .daily-bookmark {
    position: fixed !important;
    top: 12px !important;
    right: 8px !important;
    left: auto !important;
    cursor: default; // 手机上不需要拖拽提示
    // 禁止拖拽（太小没法拖）
    pointer-events: auto;
  }
  .bookmark-body {
    width: 36px;
    padding: 10px 6px 10px;
  }
  .daily-seal {
    width: 18px;
    height: 18px;
    font-size: 9px;
    margin-bottom: 6px;
  }
  .daily-label {
    display: none;
  }
  .daily-poem {
    font-size: 12px;
    letter-spacing: 2px;
  }
  .bookmark-tassel {
    height: 16px;
    margin-top: 2px;
  }
  .pin-head {
    width: 6px;
    height: 6px;
  }

  // Hero 缩小
  .hero {
    height: 380rpx;
    margin-bottom: 16rpx;
  }
  .logo-char {
    font-size: 80rpx;
  }
  .subtitle {
    font-size: 20rpx;
    letter-spacing: 10rpx;
    &::before, &::after { width: 40rpx; }
  }

  // 内容区
  .content-wrap {
    padding: 0 24rpx;
  }

  // 模式切换
  .mode-section {
    margin-top: 16rpx;
    margin-bottom: 24rpx;
  }
  .mode-tab {
    padding: 14rpx 28rpx;
  }
  .mode-tab-mark {
    font-size: 28rpx;
  }
  .mode-tab-label {
    font-size: 22rpx;
  }
  .mode-desc {
    font-size: 20rpx;
  }

  // 标签
  .tags {
    gap: 12rpx;
  }
  .tag-text {
    font-size: 24rpx;
  }

  // 分隔线
  .ink-divider {
    margin: 28rpx 32rpx 0;
  }

  // 信笺
  .input-section {
    margin-top: 28rpx;
  }
  .letter-paper {
    padding: 24rpx 36rpx 36rpx 36rpx;
    min-height: 160rpx;
  }

  // 图片上传
  .image-upload {
    gap: 12rpx;
  }

  // 选择器
  .options {
    margin-top: 28rpx;
    gap: 12rpx;
  }
  .option-item {
    padding: 16rpx 14rpx;
  }

  // 名篇速选
  .classic-chips {
    gap: 12rpx;
  }
  .classic-chip {
    padding: 12rpx 22rpx;
  }
  .classic-chip-title {
    font-size: 24rpx;
  }

  // 生成按钮
  .generate-wrap {
    margin-top: 40rpx;
    height: 200rpx;
  }

  // 剩余次数
  .quota-hint {
    margin-top: 16rpx;
  }
}

/* 极小屏（≤ 375px，如 iPhone SE） */
@media (max-width: 375px) {
  .bookmark-body {
    width: 44px;
    padding: 14px 6px 10px;
  }
  .daily-poem {
    font-size: 12px;
    letter-spacing: 2px;
  }
  .daily-seal {
    width: 18px;
    height: 18px;
    font-size: 10px;
    margin-bottom: 6px;
  }
  .daily-label {
    font-size: 8px;
  }
  .bookmark-tassel {
    height: 18px;
  }

  .hero {
    height: 320rpx;
  }
  .logo-char {
    font-size: 68rpx;
  }

  .mode-tab {
    padding: 12rpx 22rpx;
  }
}
</style>
