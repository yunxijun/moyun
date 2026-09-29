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

    <!-- 今日诗签 -->
    <view class="daily-section">
      <view class="daily-card" @tap="onDailyCardTap">
        <view class="daily-seal">签</view>
        <text class="daily-label">今日诗签</text>
        <view class="daily-poem-wrap">
          <text class="daily-poem">「{{ dailyPoem }}」</text>
        </view>
        <view class="daily-corner daily-corner-tl" />
        <view class="daily-corner daily-corner-br" />
      </view>
    </view>

    <!-- 创作区域 -->
    <view class="section">
      <view class="section-head">
        <view class="section-line" />
        <text class="section-title">开始创作</text>
        <view class="section-line" />
      </view>

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
    </view>

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
import { ref, onMounted } from 'vue'
import FloatingNav from '../../components/FloatingNav.vue'

const dailyPoem = ref('山高月小，水落石出')

// ========== 访客 ID ==========
function getVisitorId(): string {
  let id = localStorage.getItem('moyun_visitor_id')
  if (!id) {
    id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('moyun_visitor_id', id)
  }
  return id
}

// ========== 配额 ==========
const quotaRemaining = ref(-1)
const quotaLimit = ref(10)

async function fetchQuota() {
  try {
    const resp = await fetch('http://localhost:3001/api/poem/quota', {
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
        localStorage.setItem('moyun_nav_poem', JSON.stringify(result.data))
        localStorage.setItem('moyun_nav_input', JSON.stringify({
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
    const resp = await fetch('http://localhost:3001/api/poem/generate-stream', {
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

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue

        try {
          const evt = JSON.parse(jsonStr)
          if (evt.type === 'token') {
            streamingText.value += evt.content
          } else if (evt.type === 'done') {
            streamingDone.value = true
            if (evt.quota) {
              quotaRemaining.value = evt.quota.remaining
            }
            await new Promise(r => setTimeout(r, 800))
            loading.value = false
            localStorage.setItem('moyun_nav_poem', JSON.stringify(evt.poem))
            localStorage.setItem('moyun_nav_input', JSON.stringify({
              prompt: userInput.value,
              genre: selectedGenre.value,
              style: selectedStyle.value,
              images: uploadedImages.value,
            }))
            uni.navigateTo({ url: '/pages/result/result?from=storage' })
            return
          } else if (evt.type === 'error') {
            loading.value = false
            uni.showToast({ title: evt.message, icon: 'none' })
            return
          }
        } catch (_) {}
      }
    }

    // 如果流结束但没收到 done 事件
    loading.value = false
    uni.showToast({ title: '生成异常，请重试', icon: 'none' })
  } catch (err) {
    loading.value = false
    uni.showToast({ title: '网络异常，请重试', icon: 'none' })
  }
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
  padding: 0 40rpx 200rpx;
  position: relative;
  overflow-x: hidden;
}

// ══════════════════════════════════════
//  沉浸式头部
// ══════════════════════════════════════
.hero {
  position: relative;
  height: 480rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 -40rpx;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    $paper 0%,
    rgba(250, 248, 243, 0.95) 30%,
    rgba(91, 127, 149, 0.12) 70%,
    rgba(91, 127, 149, 0.22) 100%
  );
}

.mountain {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 50% 50% 0 0;

  &-far {
    height: 180rpx;
    background: linear-gradient(180deg, transparent, rgba(91, 127, 149, 0.15));
    transform: scaleX(1.6);
    bottom: 60rpx;
    animation: mountainReveal 2s ease-out forwards;
  }

  &-mid {
    height: 140rpx;
    background: linear-gradient(180deg, transparent, rgba(91, 127, 149, 0.25));
    transform: scaleX(1.3);
    bottom: 30rpx;
    animation: mountainReveal 2.4s ease-out 0.3s forwards;
    opacity: 0;
  }

  &-near {
    height: 100rpx;
    background: linear-gradient(180deg, transparent, var(--c-ink-12));
    transform: scaleX(1.1);
    animation: mountainReveal 2.8s ease-out 0.6s forwards;
    opacity: 0;
  }
}

.mist {
  position: absolute;
  height: 60rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(250, 248, 243, 0.8), transparent);
  animation: mistDrift 8s ease-in-out infinite;

  &-1 {
    width: 300rpx;
    bottom: 100rpx;
    left: 10%;
    animation-delay: 0s;
  }

  &-2 {
    width: 400rpx;
    bottom: 80rpx;
    right: 5%;
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
  font-family: 'Ma Shan Zheng', serif;
  font-size: 96rpx;
  color: $ink;
  line-height: 1;
  letter-spacing: 0;
  text-shadow: 2rpx 4rpx 12rpx var(--c-ink-08);
}

.subtitle {
  margin-top: 24rpx;
  font-size: 22rpx;
  color: $mountain;
  letter-spacing: 12rpx;
  opacity: 0.85;
}

// ══════════════════════════════════════
//  今日诗签
// ══════════════════════════════════════
.daily-section {
  display: flex;
  justify-content: center;
  margin: -40rpx 0 56rpx;
  position: relative;
  z-index: 3;
}

.daily-card {
  position: relative;
  width: 200rpx;
  min-height: 360rpx;
  background: linear-gradient(180deg, var(--c-paper-card) 0%, $paper 100%);
  border: 1rpx solid var(--c-ink-12);
  padding: 40rpx 32rpx 48rpx;
  transform: rotate(-2deg);
  box-shadow:
    4rpx 8rpx 24rpx var(--c-ink-06),
    inset 0 0 60rpx rgba(250, 248, 243, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;

  &:hover {
    transform: rotate(-2deg) translateY(-8rpx) scale(1.02);
    box-shadow:
      6rpx 12rpx 36rpx rgba(26, 26, 46, 0.1),
      inset 0 0 60rpx rgba(250, 248, 243, 0.5);
  }

  &:active {
    transform: rotate(-1deg) scale(0.98);
  }
}

.daily-seal {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid $cinnabar;
  color: $cinnabar;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4rpx;
  opacity: 0.7;
  transform: rotate(8deg);
}

.daily-label {
  font-size: 20rpx;
  color: $mountain;
  letter-spacing: 6rpx;
  writing-mode: vertical-rl;
  margin-bottom: 24rpx;
  opacity: 0.7;
}

.daily-poem-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
}

.daily-poem {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 32rpx;
  color: $ink;
  writing-mode: vertical-rl;
  letter-spacing: 8rpx;
  line-height: 1.8;
}

.daily-corner {
  position: absolute;
  width: 24rpx;
  height: 24rpx;
  border-color: var(--c-ink-15);
  border-style: solid;

  &-tl {
    top: 12rpx;
    left: 12rpx;
    border-width: 2rpx 0 0 2rpx;
  }

  &-br {
    bottom: 12rpx;
    right: 12rpx;
    border-width: 0 2rpx 2rpx 0;
  }
}

// ══════════════════════════════════════
//  创作区域
// ══════════════════════════════════════
.section {
  margin-top: 16rpx;
}

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
  gap: 16rpx;
  justify-content: center;
}

.tag {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  border: 1rpx solid rgba(26, 26, 46, 0.1);
  border-radius: 999rpx;
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
  font-size: 24rpx;
  color: var(--c-ink-75);
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
      rgba(26, 26, 46, 0.012) 3rpx,
      rgba(26, 26, 46, 0.012) 4rpx
    ),
    linear-gradient(180deg, rgba(255, 254, 249, 0.85), rgba(245, 240, 230, 0.6));
  border: 1rpx solid var(--c-border);
  border-radius: 8rpx;
  padding: 32rpx 56rpx 48rpx 48rpx;
  min-height: 200rpx;
  transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;

  &:focus-within {
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3rpx,
        rgba(26, 26, 46, 0.012) 3rpx,
        rgba(26, 26, 46, 0.012) 4rpx
      ),
      linear-gradient(180deg, rgba(255, 254, 249, 0.95), rgba(250, 248, 243, 0.85));
    border-color: rgba(91, 127, 149, 0.2);
    box-shadow: 0 6rpx 24rpx rgba(26, 26, 46, 0.05);
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
  font-family: 'Ma Shan Zheng', serif;
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
  font-family: 'Ma Shan Zheng', serif;
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
  font-family: 'Ma Shan Zheng', serif;
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
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 28rpx,
      rgba(26, 26, 46, 0.018) 28rpx,
      rgba(26, 26, 46, 0.018) 29rpx
    ),
    linear-gradient(180deg, #fffef9 0%, #f5f0e6 100%);
  border: 1rpx solid rgba(26, 26, 46, 0.1);
  border-radius: 8rpx;
  padding: 20rpx 18rpx;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    background:
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 28rpx,
        rgba(26, 26, 46, 0.018) 28rpx,
        rgba(26, 26, 46, 0.018) 29rpx
      ),
      linear-gradient(180deg, #fffef9 0%, #f0ebe0 100%);
    border-color: rgba(91, 127, 149, 0.25);
    box-shadow: 0 3rpx 12rpx rgba(26, 26, 46, 0.05);
    transform: translateY(-1rpx);
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
  font-family: 'Ma Shan Zheng', serif;
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
      font-family: 'Ma Shan Zheng', serif;
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
  margin-top: 72rpx;
  height: 260rpx;
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
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
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
  margin-top: 24rpx;
  padding: 0 40rpx;
}

.quota-line {
  flex: 1;
  max-width: 120rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, var(--c-ink-12), transparent);
}

.quota-text {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 22rpx;
  color: rgba(91, 127, 149, 0.75);
  writing-mode: vertical-rl;
  letter-spacing: 4rpx;
  line-height: 1.6;
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
  font-family: 'Ma Shan Zheng', serif;
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
  font-family: 'Ma Shan Zheng', serif;
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
  }

  /* 头部英雄区 — 月夜山水 */
  .hero-bg {
    background: linear-gradient(180deg, #0e1520 0%, #162030 40%, #1a2838 70%, #0e1520 100%) !important;
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

  /* 每日诗签 — 暖烛感 */
  .daily-card {
    background: linear-gradient(135deg, #1e2430 0%, #252d3a 100%) !important;
    border-color: rgba(212, 160, 23, 0.15) !important;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3) !important;
  }
  .daily-seal { color: var(--c-vermilion); }
  .daily-label { color: rgba(232, 228, 223, 0.5); }
  .daily-poem { color: rgba(232, 228, 223, 0.8) !important; }

  /* 快捷标签 — 墨色水墨签 */
  .quick-tag {
    background: rgba(232, 228, 223, 0.04) !important;
    border-color: rgba(232, 228, 223, 0.1) !important;
    color: rgba(232, 228, 223, 0.6) !important;

    &:hover, &.active {
      background: rgba(224, 96, 64, 0.1) !important;
      border-color: rgba(224, 96, 64, 0.3) !important;
      color: var(--c-vermilion) !important;
    }
  }

  /* 「开始创作」标题 */
  .section-title { color: var(--c-ink) !important; }
  .section-line { background: rgba(232, 228, 223, 0.08) !important; }

  /* 信笺输入区 */
  .letter-paper {
    background: #222230 !important;
    border-color: rgba(232, 228, 223, 0.08);
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
}
</style>
