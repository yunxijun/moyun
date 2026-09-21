<template>
  <view class="page">
    <!-- 书法卡片预览区 -->
    <view class="card-preview">
      <canvas
        canvas-id="calligraphyCanvas"
        id="calligraphyCanvas"
        class="canvas"
        :style="{ width: '686rpx', height: '914rpx' }"
      />
    </view>

    <!-- 诗词信息 -->
    <view class="poem-info">
      <text class="poem-title">《{{ poem.title }}》</text>
      <text class="poem-genre">{{ poem.genre }}</text>

      <view class="poem-content">
        <text v-for="(line, idx) in poem.content" :key="idx" class="poem-line">
          {{ line }}
        </text>
      </view>

      <!-- 译文 -->
      <view class="section" @tap="showTranslation = !showTranslation">
        <text class="section-header">📖 白话译文 {{ showTranslation ? '▲' : '▼' }}</text>
        <text v-if="showTranslation" class="section-body">{{ poem.translation }}</text>
      </view>

      <!-- 赏析 -->
      <view class="section" @tap="showAppreciation = !showAppreciation">
        <text class="section-header">🎨 赏析 {{ showAppreciation ? '▲' : '▼' }}</text>
        <text v-if="showAppreciation" class="section-body">{{ poem.appreciation }}</text>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="actions">
      <view class="action-row">
        <view class="action-btn" @tap="onChangeFont">
          <text>换字体</text>
        </view>
        <view class="action-btn" @tap="onChangeBackground">
          <text>换背景</text>
        </view>
        <view class="action-btn" @tap="onRegenerate">
          <text>重新生成</text>
        </view>
      </view>
      <view class="action-row primary">
        <view class="action-btn save" @tap="onSaveImage">
          <text>💾 保存图片</text>
        </view>
        <view class="action-btn share" @tap="onShare">
          <text>📤 分享好友</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PoemResult, CalligraphyFont, CardBackground } from '@moyun/core'

const poem = ref<PoemResult>({
  title: '秋思',
  genre: '七言绝句',
  rhyme: '先韵',
  content: [
    '枫林晚照映长天，',
    '雁字南归带暮烟。',
    '独倚西楼人不见，',
    '一江秋水月如弦。',
  ],
  translation: '深秋枫林在夕阳映照下与长天相接，南归的雁阵带着暮色中的薄烟远去。独自倚靠在西楼上，思念的人却不见踪影，只有一江秋水上弦月如钩。',
  appreciation: '此诗以枫林、归雁、西楼、秋水等经典意象构成完整的秋日画卷，由远及近、由景入情，末句以「月如弦」喻相思不圆满，含蓄深远。',
})

const currentFont = ref<CalligraphyFont>('MaShanZheng')
const currentBackground = ref<CardBackground>('xuan-paper')
const showTranslation = ref(false)
const showAppreciation = ref(false)

onMounted(() => {
  // TODO: 从路由参数获取诗词数据或调用 API
  // TODO: 绘制 Canvas 书法卡片
})

function onChangeFont() {
  // TODO: 弹出字体选择面板
  const fonts: CalligraphyFont[] = ['MaShanZheng', 'LiuJianMaoCao', 'ZhiMangXing', 'LongCang']
  const currentIdx = fonts.indexOf(currentFont.value)
  currentFont.value = fonts[(currentIdx + 1) % fonts.length]
  uni.showToast({ title: `已切换字体`, icon: 'none' })
}

function onChangeBackground() {
  // TODO: 弹出背景选择面板
  uni.showToast({ title: '换背景功能开发中', icon: 'none' })
}

function onRegenerate() {
  uni.showToast({ title: '重新生成中...', icon: 'loading' })
  // TODO: 重新调用 API
}

function onSaveImage() {
  // TODO: Canvas 导出图片并保存到相册
  uni.showToast({ title: '保存功能开发中', icon: 'none' })
}

function onShare() {
  // TODO: 微信分享
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f0e8;
  padding: 24rpx 32rpx 160rpx;
}

.card-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.canvas {
  background: #faf6ef;
  border: 1rpx solid #e0d5c0;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.poem-info {
  padding: 0 16rpx;
}

.poem-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a1a1a;
  display: block;
  text-align: center;
}

.poem-genre {
  font-size: 24rpx;
  color: #999;
  display: block;
  text-align: center;
  margin: 8rpx 0 24rpx;
}

.poem-content {
  text-align: center;
  margin-bottom: 32rpx;
}

.poem-line {
  display: block;
  font-size: 32rpx;
  color: #333;
  line-height: 2;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.section-header {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.section-body {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  margin-top: 12rpx;
  display: block;
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f5f0e8;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e0d5c0;
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;

  &.primary {
    margin-bottom: 0;
  }
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  font-size: 26rpx;
  background: #fff;
  border: 1rpx solid #e0d5c0;
  color: #555;

  &.save {
    background: #1a1a1a;
    color: #f5f0e8;
    border-color: #1a1a1a;
  }

  &.share {
    background: #cc3333;
    color: #fff;
    border-color: #cc3333;
  }
}
</style>
