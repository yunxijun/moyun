<template>
  <view class="page">
    <!-- 水墨山水头部 -->
    <view class="profile-banner">
      <view class="mountain m1" />
      <view class="mountain m2" />
      <view class="mountain m3" />
      <view class="mist" />

      <view class="profile-header">
        <view class="avatar calligraphy">
          <text>墨</text>
        </view>
        <text class="nickname">{{ profile.nickname || '墨客' }}</text>
        <text class="membership">{{ profile.membership === 'free' ? '免费用户' : 'VIP会员' }}</text>
      </view>
    </view>

    <!-- 统计区 -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-num calligraphy">{{ profile.stats?.totalPoems || 0 }}</text>
        <text class="stat-label">创作总数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num calligraphy">{{ profile.stats?.todayPoems || 0 }}</text>
        <text class="stat-label">今日创作</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num calligraphy">{{ profile.quota?.remaining ?? '-' }}</text>
        <text class="stat-label">剩余次数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @tap="goTo('history')">
        <view class="menu-left">
          <view class="menu-dot dot-green" />
          <text class="menu-text">创作历史</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goTo('favorite')">
        <view class="menu-left">
          <view class="menu-dot dot-gold" />
          <text class="menu-text">我的收藏</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goTo('settings')">
        <view class="menu-left">
          <view class="menu-dot dot-gray" />
          <text class="menu-text">偏好设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goTo('about')">
        <view class="menu-left">
          <view class="menu-dot dot-cyan" />
          <text class="menu-text">关于墨韵</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 浮动导航 -->
    <FloatingNav />

    <!-- 创作历史 -->
    <view class="history-section">
      <view class="section-head">
        <view class="section-accent" />
        <text class="section-title calligraphy">近作</text>
      </view>

      <view v-if="history.length === 0" class="empty-hint">
        <view class="empty-illustration">
          <text class="empty-char calligraphy">空</text>
          <view class="empty-brush" />
        </view>
        <text class="empty-text">尚无墨痕</text>
        <text class="empty-sub">去首页挥毫，留下你的第一首诗</text>
      </view>

      <view
        v-for="item in history"
        :key="item.id"
        class="history-card"
        @tap="onViewPoem(item)"
      >
        <view class="history-accent" />
        <view class="history-content">
          <view class="history-header">
            <text class="history-title calligraphy">《{{ item.poem.title }}》</text>
            <text class="history-genre">{{ item.poem.genre }}</text>
          </view>
          <text class="history-preview">{{ item.poem.content.join('') }}</text>
          <text class="history-time">{{ formatTime(item.createdAt) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FloatingNav from '../../components/FloatingNav.vue'

interface PoemRecord {
  id: string
  poem: { title: string; genre: string; content: string[]; translation: string; appreciation: string; rhyme: string }
  createdAt: string
}

const profile = ref<any>({})
const history = ref<PoemRecord[]>([])

function getVisitorId(): string {
  return localStorage.getItem('moyun_visitor_id') || 'anonymous'
}

async function loadProfile() {
  try {
    const resp = await fetch('http://localhost:3001/api/user/profile', {
      headers: { 'x-visitor-id': getVisitorId() },
    })
    const data = await resp.json()
    if (data.success) profile.value = data.data
  } catch (_) {}
}

async function loadHistory() {
  try {
    const resp = await fetch('http://localhost:3001/api/user/history', {
      headers: { 'x-visitor-id': getVisitorId() },
    })
    const data = await resp.json()
    if (data.success) history.value = data.data.items
  } catch (_) {}
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function onViewPoem(item: PoemRecord) {
  localStorage.setItem('moyun_nav_poem', JSON.stringify(item.poem))
  uni.navigateTo({ url: '/pages/result/result?from=storage' })
}

function goTo(page: string) {
  if (page === 'history') {
    uni.showToast({ title: '请往下滑动查看', icon: 'none' })
  } else {
    uni.showToast({ title: `${page} 功能开发中`, icon: 'none' })
  }
}

onMounted(() => {
  loadProfile()
  loadHistory()
})
</script>

<style lang="scss">
@import '@fontsource/ma-shan-zheng';

.calligraphy {
  font-family: 'Ma Shan Zheng', serif;
}

.page {
  min-height: 100vh;
  background-color: var(--c-paper);
  padding-bottom: 200rpx;
}

/* ── 水墨山水头部 ── */
.profile-banner {
  position: relative;
  height: 420rpx;
  background: linear-gradient(180deg, var(--c-mountain) 0%, #4a6d82 35%, #8aabbe 65%, var(--c-paper) 100%);
  overflow: hidden;
}

.mountain {
  position: absolute;
  bottom: 60rpx;
  border-radius: 50% 50% 0 0;
}

.m1 {
  left: -10%;
  width: 55%;
  height: 200rpx;
  background: var(--c-ink-25);
}

.m2 {
  left: 25%;
  width: 50%;
  height: 260rpx;
  background: var(--c-ink-12);
}

.m3 {
  right: -5%;
  width: 45%;
  height: 180rpx;
  background: var(--c-ink-25);
}

.mist {
  position: absolute;
  bottom: 80rpx;
  left: 0;
  right: 0;
  height: 80rpx;
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--c-paper) 60%, transparent));
}

.profile-header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 72rpx;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: var(--c-paper-card);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  margin-bottom: 20rpx;

  text {
    font-size: 56rpx;
    color: var(--c-ink);
    line-height: 1;
  }
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--c-paper);
  letter-spacing: 6rpx;
  text-shadow: 0 2rpx 8rpx var(--c-ink-25);
}

.membership {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 22rpx;
  color: color-mix(in srgb, var(--c-paper) 80%, transparent);
  margin-top: 10rpx;
  letter-spacing: 4rpx;
  padding: 4rpx 24rpx;
  border: 1rpx solid color-mix(in srgb, var(--c-paper) 30%, transparent);
  border-radius: 2rpx;
}

/* ── 统计区 ── */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -48rpx 32rpx 40rpx;
  padding: 40rpx 0;
  background: var(--c-paper-card);
  border: 1rpx solid var(--c-divider);
  border-radius: 4rpx;
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 3;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-num {
  font-size: 52rpx;
  color: var(--c-ink);
  line-height: 1;
  writing-mode: horizontal-tb;
}

.stat-label {
  font-size: 20rpx;
  color: var(--c-mountain);
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  height: 56rpx;
  background: var(--c-ink-12);
}

/* ── 功能菜单 ── */
.menu-section {
  margin: 0 32rpx 48rpx;
  background: linear-gradient(180deg, var(--c-paper-card), var(--c-paper));
  background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, var(--c-ink-06) 3px, var(--c-ink-06) 4px);
  border: 1rpx solid var(--c-border);
  border-top: 3rpx solid color-mix(in srgb, var(--c-vermilion) 30%, transparent);
  border-radius: 4rpx;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid var(--c-divider);
  transition: background 0.25s ease, padding-left 0.25s ease;

  &:hover {
    background: var(--c-ink-06);
    padding-left: 36rpx;

    .menu-dot {
      box-shadow: 0 0 0 2rpx currentColor;
      opacity: 0.8;
    }
    .menu-arrow {
      color: var(--c-ink-45);
      transform: translateX(4rpx);
    }
  }

  &:active {
    background: var(--c-ink-08);
  }

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 2rpx;
  flex-shrink: 0;
}

.dot-green {
  background: #5a9a6f;
}

.dot-gold {
  background: var(--c-gold);
}

.dot-gray {
  background: #8a8a9a;
}

.dot-cyan {
  background: var(--c-mountain);
}

.menu-text {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 30rpx;
  color: var(--c-ink);
  letter-spacing: 4rpx;
}

.menu-arrow {
  font-family: 'Ma Shan Zheng', serif;
  color: var(--c-ink-15);
  font-size: 28rpx;
  transition: color 0.25s ease, transform 0.25s ease;
}

/* ── 创作历史 ── */
.history-section {
  padding: 0 32rpx;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.section-accent {
  width: 4rpx;
  height: 36rpx;
  background: var(--c-vermilion);
  border-radius: 2rpx;
}

.section-title {
  font-size: 40rpx;
  color: var(--c-ink);
  letter-spacing: 8rpx;
}

.empty-hint {
  text-align: center;
  padding: 80rpx 0 60rpx;
}

.empty-illustration {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-char {
  font-size: 100rpx;
  color: var(--c-ink-06);
}

.empty-brush {
  position: absolute;
  bottom: 20rpx;
  right: 10rpx;
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--c-vermilion) 30%, transparent));
  transform: rotate(-25deg);
  border-radius: 2rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: var(--c-mountain);
  letter-spacing: 6rpx;
}

.empty-sub {
  display: block;
  font-size: 22rpx;
  color: color-mix(in srgb, var(--c-mountain) 60%, transparent);
  margin-top: 16rpx;
}

.history-card {
  display: flex;
  background: linear-gradient(180deg, var(--c-paper-card), var(--c-paper));
  border: 1rpx solid var(--c-divider);
  border-radius: 4rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: var(--c-ink-12);
    box-shadow: var(--shadow-md);
  }

  &:active {
    opacity: 0.9;
  }
}

.history-accent {
  width: 6rpx;
  flex-shrink: 0;
  background: var(--c-vermilion);
  opacity: 0.7;
}

.history-content {
  flex: 1;
  padding: 28rpx 24rpx;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.history-title {
  font-size: 30rpx;
  color: var(--c-ink);
  letter-spacing: 2rpx;
}

.history-genre {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 20rpx;
  color: var(--c-mountain);
  background: color-mix(in srgb, var(--c-mountain) 8%, transparent);
  padding: 4rpx 14rpx;
  border: 1rpx solid color-mix(in srgb, var(--c-mountain) 15%, transparent);
  border-radius: 2rpx;
}

.history-preview {
  font-size: 26rpx;
  color: var(--c-ink-65);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-time {
  display: block;
  font-size: 20rpx;
  color: var(--c-ink-45);
  margin-top: 16rpx;
}

/* ══ 深色模式覆盖 ══ */
:root[data-theme="dark"] {
  .page { background-color: var(--c-paper); }

  .profile-banner {
    background: linear-gradient(180deg, #2a3a45 0%, #1e2e38 35%, #3a5060 65%, var(--c-paper) 100%);
  }
  .mountain { opacity: 0.6; }
  .nickname { color: #f0ece6; }
  .membership {
    color: rgba(240, 236, 230, 0.75);
    border-color: rgba(240, 236, 230, 0.25);
  }
  .avatar {
    background: var(--c-paper-card);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
    text { color: var(--c-ink); }
  }

  .stats-row {
    background: var(--c-paper-card) !important;
    border-color: rgba(232, 228, 223, 0.06);
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);
  }
  .stat-num { color: var(--c-ink); }
  .stat-label { color: var(--c-mountain); }
  .stat-divider { background: rgba(232, 228, 223, 0.08); }

  .menu-section {
    background: var(--c-paper-card) !important;
    background-image: none !important;
    border-color: rgba(232, 228, 223, 0.06);
    border-top-color: rgba(224, 96, 64, 0.35);
  }
  .menu-item {
    border-bottom-color: rgba(232, 228, 223, 0.04);
    &:hover { background: rgba(232, 228, 223, 0.04); }
  }
  .menu-text { color: var(--c-ink); }
  .menu-arrow { color: rgba(232, 228, 223, 0.15); }

  .section-title { color: var(--c-ink); }

  .history-card {
    background: var(--c-paper-card) !important;
    border-color: rgba(232, 228, 223, 0.06);
    &:hover { border-color: rgba(232, 228, 223, 0.12); }
  }
  .history-accent { background: var(--c-vermilion); }
  .history-title { color: var(--c-ink); }
  .history-genre {
    color: var(--c-mountain);
    background: rgba(122, 168, 194, 0.1);
    border-color: rgba(122, 168, 194, 0.15);
  }
  .history-preview { color: rgba(232, 228, 223, 0.5); }
  .history-time { color: rgba(232, 228, 223, 0.25); }

  .empty-char { color: rgba(232, 228, 223, 0.06); }
  .empty-text { color: var(--c-mountain); }
  .empty-sub { color: rgba(122, 168, 194, 0.5); }
}
</style>
