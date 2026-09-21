<template>
  <view class="page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="logo">墨韵</text>
      <text class="subtitle">AI 诗词书法</text>
    </view>

    <!-- 今日诗签 -->
    <view class="daily-card" @tap="onDailyCardTap">
      <text class="daily-label">今日诗签</text>
      <text class="daily-poem">「{{ dailyPoem }}」</text>
    </view>

    <!-- 创作方式选择 -->
    <view class="section">
      <text class="section-title">开始创作</text>

      <!-- 快捷主题标签 -->
      <view class="tags">
        <view
          v-for="tag in quickTags"
          :key="tag.value"
          class="tag"
          :class="{ active: selectedTag === tag.value }"
          @tap="onSelectTag(tag.value)"
        >
          <text>{{ tag.icon }} {{ tag.label }}</text>
        </view>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-section">
      <textarea
        v-model="userInput"
        class="input-area"
        placeholder="输入你的心情、场景或主题..."
        :maxlength="200"
        auto-height
      />

      <!-- 图片上传 -->
      <view class="image-upload">
        <view
          v-for="(img, idx) in uploadedImages"
          :key="idx"
          class="image-preview"
        >
          <image :src="img" mode="aspectFill" class="preview-img" />
          <view class="remove-btn" @tap="removeImage(idx)">×</view>
        </view>
        <view
          v-if="uploadedImages.length < 3"
          class="add-image"
          @tap="onChooseImage"
        >
          <text class="add-icon">📷</text>
          <text class="add-text">拍照作诗</text>
        </view>
      </view>
    </view>

    <!-- 创作选项 -->
    <view class="options">
      <picker :range="genres" @change="onGenreChange">
        <view class="option-item">
          <text>体裁：{{ selectedGenre || '自动' }}</text>
        </view>
      </picker>
      <picker :range="styles" @change="onStyleChange">
        <view class="option-item">
          <text>风格：{{ selectedStyle || '自动' }}</text>
        </view>
      </picker>
    </view>

    <!-- 生成按钮 -->
    <view class="generate-btn" @tap="onGenerate">
      <text class="btn-text">{{ loading ? '灵感涌来...' : '✍️ 生成诗词' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dailyPoem = ref('山高月小，水落石出')

const quickTags = [
  { icon: '🏔️', label: '写景', value: '写景' },
  { icon: '💭', label: '抒情', value: '抒情' },
  { icon: '🎋', label: '节气', value: '节气' },
  { icon: '🌙', label: '思乡', value: '思乡' },
  { icon: '🍃', label: '送别', value: '送别' },
  { icon: '🎎', label: '节日', value: '节日' },
  { icon: '❤️', label: '爱情', value: '爱情' },
  { icon: '⚔️', label: '壮志', value: '壮志' },
]

const genres = ['自动', '五言绝句', '七言绝句', '五言律诗', '七言律诗', '词', '对联']
const styles = ['自动', '豪放', '婉约', '田园', '边塞', '清新', '古朴']

const selectedTag = ref('')
const userInput = ref('')
const selectedGenre = ref('')
const selectedStyle = ref('')
const uploadedImages = ref<string[]>([])
const loading = ref(false)

function onSelectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  if (selectedTag.value && !userInput.value) {
    userInput.value = tag
  }
}

function onGenreChange(e: any) {
  selectedGenre.value = genres[e.detail.value] === '自动' ? '' : genres[e.detail.value]
}

function onStyleChange(e: any) {
  selectedStyle.value = styles[e.detail.value] === '自动' ? '' : styles[e.detail.value]
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

  try {
    // TODO: 调用后端 API 生成诗词
    // 临时模拟跳转
    setTimeout(() => {
      loading.value = false
      uni.navigateTo({
        url: `/pages/result/result?prompt=${encodeURIComponent(userInput.value)}`,
      })
    }, 1500)
  } catch {
    loading.value = false
    uni.showToast({ title: '生成失败，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f0e8;
  padding: 0 32rpx 120rpx;
}

.header {
  padding: 100rpx 0 40rpx;
  text-align: center;
}

.logo {
  font-size: 64rpx;
  font-weight: bold;
  color: #1a1a1a;
  letter-spacing: 16rpx;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-top: 8rpx;
  letter-spacing: 8rpx;
}

.daily-card {
  background: linear-gradient(135deg, #faf6ef 0%, #f0e8d8 100%);
  border: 1rpx solid #e0d5c0;
  border-radius: 16rpx;
  padding: 32rpx;
  margin: 24rpx 0;
  text-align: center;
}

.daily-label {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}

.daily-poem {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
}

.section {
  margin-top: 32rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  background: #fff;
  border: 1rpx solid #e0d5c0;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #555;

  &.active {
    background: #1a1a1a;
    color: #f5f0e8;
    border-color: #1a1a1a;
  }
}

.input-section {
  margin-top: 32rpx;
}

.input-area {
  width: 100%;
  min-height: 120rpx;
  background: #fff;
  border: 1rpx solid #e0d5c0;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.image-upload {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}

.image-preview {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.preview-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
}

.remove-btn {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 36rpx;
  height: 36rpx;
  background: #cc3333;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 36rpx;
  font-size: 24rpx;
}

.add-image {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.add-icon {
  font-size: 40rpx;
}

.add-text {
  font-size: 22rpx;
  color: #999;
}

.options {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.option-item {
  background: #fff;
  border: 1rpx solid #e0d5c0;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  color: #666;
}

.generate-btn {
  margin-top: 40rpx;
  background: #1a1a1a;
  border-radius: 48rpx;
  padding: 28rpx 0;
  text-align: center;
}

.btn-text {
  color: #f5f0e8;
  font-size: 32rpx;
  letter-spacing: 4rpx;
}
</style>
