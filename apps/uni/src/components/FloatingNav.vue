<template>
  <view class="side-nav" @mouseenter="isExpanded = true" @mouseleave="isExpanded = false">
    <!-- 印章logo -->
    <view class="nav-seal" @tap="toggleNav">
      <text class="seal-text">墨</text>
    </view>

    <!-- 导航项 -->
    <view class="nav-items" :class="{ show: isExpanded }">
      <view
        v-for="(item, idx) in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: currentPath === item.path }"
        :style="{ transitionDelay: isExpanded ? `${idx * 0.06}s` : '0s' }"
        @tap="navigate(item.path)"
      >
        <text class="nav-char">{{ item.char }}</text>
      </view>
      <!-- 主题切换 -->
      <view
        class="nav-item nav-item--theme"
        :style="{ transitionDelay: isExpanded ? `${navItems.length * 0.06}s` : '0s' }"
        @tap="onToggleTheme"
      >
        <text class="nav-char">{{ isDark ? '昼' : '夜' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggle: onToggleTheme } = useTheme()
const isExpanded = ref(false)

const navItems = [
  { char: '笔', label: '创作', path: '/pages/index/index' },
  { char: '鉴', label: '发现', path: '/pages/discover/discover' },
  { char: '我', label: '我的', path: '/pages/mine/mine' },
]

const currentPath = computed(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  return '/' + (page?.route || '')
})

function toggleNav() {
  isExpanded.value = !isExpanded.value
}

function navigate(path: string) {
  if (currentPath.value === path) {
    isExpanded.value = false
    return
  }
  isExpanded.value = false
  uni.reLaunch({ url: path })
}
</script>

<style lang="scss">
.side-nav {
  position: fixed;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.nav-seal {
  width: 72rpx;
  height: 72rpx;
  border: 3rpx solid var(--c-vermilion);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.08) rotate(-2deg);
    box-shadow: 0 8rpx 32rpx rgba(199, 62, 29, 0.2);
    background: rgba(199, 62, 29, 0.06);
  }

  &:active {
    transform: scale(0.95);
  }
}

.seal-text {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 36rpx;
  color: var(--c-vermilion);
  line-height: 1;
}

.nav-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  overflow: hidden;
}

.nav-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-ink-06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1rpx solid var(--c-ink-06);
  opacity: 0;
  transform: translateX(20rpx);
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  pointer-events: none;

  .show & {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  &:hover {
    background: rgba(26, 26, 46, 0.08);
    border-color: rgba(26, 26, 46, 0.12);
    box-shadow: 0 4rpx 16rpx rgba(26, 26, 46, 0.08);
    transform: translateX(-4rpx);
  }

  &:active {
    transform: scale(0.92);
  }

  &.active {
    background: rgba(199, 62, 29, 0.1);
    border-color: rgba(199, 62, 29, 0.4);
    box-shadow: 0 2rpx 12rpx rgba(199, 62, 29, 0.12);

    .nav-char {
      color: var(--c-vermilion);
    }
  }
}

.nav-char {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 28rpx;
  color: var(--c-ink);
  line-height: 1;
  letter-spacing: 0;
}

.nav-item--theme {
  border: 1rpx dashed var(--c-ink-25);
  background: transparent;

  .nav-char {
    font-size: 24rpx;
    opacity: 0.7;
  }

  &:hover {
    border-style: solid;
    .nav-char { opacity: 1; }
  }
}
</style>
