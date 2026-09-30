<template>
  <view
    class="side-nav"
    :class="{ 'is-pinned': isPinned }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <!-- 印章logo — 单击展开/收起，双击钉住 -->
    <view class="nav-seal" :class="{ 'seal-pinned': isPinned }" @tap="onSealTap">
      <text class="seal-text">墨</text>
      <view v-if="isPinned" class="pin-dot" />
    </view>

    <!-- 导航项 -->
    <view class="nav-items" :class="{ show: isVisible }">
      <view
        v-for="(item, idx) in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: currentPath === item.path }"
        :style="{ transitionDelay: isVisible ? `${idx * 0.06}s` : '0s' }"
        @tap="navigate(item.path)"
      >
        <text class="nav-char">{{ item.char }}</text>
      </view>
      <!-- 主题切换 -->
      <view
        class="nav-item nav-item--theme"
        :style="{ transitionDelay: isVisible ? `${navItems.length * 0.06}s` : '0s' }"
        @tap="onToggleTheme"
      >
        <text class="nav-char">{{ isDark ? '昼' : '夜' }}</text>
      </view>
      <!-- 钉住/取消钉住 -->
      <view
        class="nav-item nav-item--pin"
        :class="{ 'nav-item--pin-active': isPinned }"
        :style="{ transitionDelay: isVisible ? `${(navItems.length + 1) * 0.06}s` : '0s' }"
        @tap="togglePin"
      >
        <text class="nav-char">{{ isPinned ? '收' : '钉' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggle: onToggleTheme } = useTheme()
const isPinned = ref(uni.getStorageSync('moyun_nav_pinned') === 'true')
const isHovering = ref(false)
const isManualOpen = ref(false)

const isVisible = computed(() => isPinned.value || isHovering.value || isManualOpen.value)

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

function onEnter() { isHovering.value = true }
function onLeave() { isHovering.value = false; isManualOpen.value = false }

function onSealTap() {
  if (isPinned.value) return
  isManualOpen.value = !isManualOpen.value
}

function togglePin() {
  isPinned.value = !isPinned.value
  uni.setStorageSync('moyun_nav_pinned', String(isPinned.value))
}

function navigate(path: string) {
  if (currentPath.value === path) {
    if (!isPinned.value) isManualOpen.value = false
    return
  }
  if (!isPinned.value) isManualOpen.value = false
  uni.reLaunch({ url: path })
}
</script>

<style lang="scss">
.side-nav {
  position: fixed;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  transition: none !important;

  /* #ifdef H5 */
  * { transition-property: opacity, transform, background, border-color, box-shadow, color !important; }
  /* #endif */
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
  position: relative;

  &:hover {
    transform: scale(1.08) rotate(-2deg);
    box-shadow: 0 8rpx 32rpx rgba(199, 62, 29, 0.2);
    background: rgba(199, 62, 29, 0.06);
  }
  &:active { transform: scale(0.95); }

  &.seal-pinned {
    box-shadow: 0 0 0 3rpx rgba(199, 62, 29, 0.15), var(--shadow-sm);
  }
}

.seal-text {
  font-family: var(--ui-font);
  font-size: 36rpx;
  color: var(--c-vermilion);
  line-height: 1;
}

.pin-dot {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: var(--c-vermilion);
}

.nav-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  overflow: visible;
}

.nav-item {
  width: 80rpx;
  height: 80rpx;
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
    transform: rotate(-3deg) scale(1.05);
  }
  &:active { transform: scale(0.92); }

  &.active {
    background: rgba(199, 62, 29, 0.1);
    border-color: rgba(199, 62, 29, 0.4);
    box-shadow: 0 2rpx 12rpx rgba(199, 62, 29, 0.12);
    .nav-char { color: var(--c-vermilion); }
  }
}

.nav-char {
  font-family: var(--ui-font);
  font-size: 32rpx;
  color: var(--c-ink);
  line-height: 1;
  letter-spacing: 0;
}

.nav-item--theme {
  border: 1rpx dashed var(--c-ink-25);
  background: transparent;
  .nav-char { font-size: 24rpx; opacity: 0.7; }
  &:hover { border-style: solid; .nav-char { opacity: 1; } }
}

.nav-item--pin {
  border: 1rpx dashed var(--c-ink-15);
  background: transparent;
  .nav-char { font-size: 22rpx; opacity: 0.5; }
  &:hover { border-style: solid; .nav-char { opacity: 0.8; } }
  &.nav-item--pin-active {
    border-color: rgba(199, 62, 29, 0.3);
    border-style: solid;
    background: rgba(199, 62, 29, 0.05);
    .nav-char { color: var(--c-vermilion); opacity: 0.8; }
  }
}
</style>
