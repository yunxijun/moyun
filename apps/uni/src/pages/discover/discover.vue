<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">发现</text>
      <text class="subtitle">诗词之海，共赏风雅</text>
      <view class="header-ornament" />
    </view>

    <!-- 今日推荐 -->
    <view class="recommend-section">
      <view class="section-label">
        <view class="label-line" />
        <text class="label-text">今日推荐</text>
        <view class="label-line" />
      </view>

      <view class="recommend-card" @tap="onViewPoem(dailyRecommend)">
        <view class="recommend-bg" />
        <view class="recommend-accent" />

        <view class="recommend-inner">
          <text class="recommend-title calligraphy">《{{ dailyRecommend.poem.title }}》</text>

          <view class="vertical-poem">
            <text
              v-for="(line, idx) in dailyRecommend.poem.content.slice(0, 4)"
              :key="idx"
              class="vertical-line"
            >
              {{ line }}
            </text>
          </view>

          <view class="recommend-footer">
            <text class="recommend-genre">{{ dailyRecommend.poem.genre }}</text>
            <text class="recommend-hint">轻触品读 ›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 浮动导航 -->
    <FloatingNav />

    <!-- 精选瀑布流 -->
    <view class="section">
      <view class="section-head">
        <text class="section-title calligraphy">精选</text>
        <text class="section-desc">墨香流转，佳句云集</text>
      </view>

      <view v-if="featured.length === 0" class="empty-hint">
        <text class="empty-icon calligraphy">空</text>
        <text class="empty-text">暂无精选作品</text>
        <text class="empty-sub">去首页创作，你的佳作可能被推荐哦</text>
      </view>

      <view v-else class="waterfall">
        <view class="waterfall-col">
          <view
            v-for="item in leftColumn"
            :key="item.id"
            class="poem-card"
            :class="getCardTone(item.id)"
            @tap="onViewPoem(item)"
          >
            <text class="poem-card-title calligraphy">《{{ item.poem.title }}》</text>
            <view class="poem-card-body">
              <text
                v-for="(line, idx) in item.poem.content.slice(0, 4)"
                :key="idx"
                class="poem-card-line"
              >
                {{ line }}
              </text>
            </view>
            <view class="poem-card-footer">
              <text class="poem-card-badge">{{ item.poem.genre }}</text>
              <text class="poem-card-time">{{ formatTime(item.createdAt) }}</text>
            </view>
          </view>
        </view>

        <view class="waterfall-col">
          <view
            v-for="item in rightColumn"
            :key="item.id"
            class="poem-card"
            :class="getCardTone(item.id)"
            @tap="onViewPoem(item)"
          >
            <text class="poem-card-title calligraphy">《{{ item.poem.title }}》</text>
            <view class="poem-card-body">
              <text
                v-for="(line, idx) in item.poem.content.slice(0, 4)"
                :key="idx"
                class="poem-card-line"
              >
                {{ line }}
              </text>
            </view>
            <view class="poem-card-footer">
              <text class="poem-card-badge">{{ item.poem.genre }}</text>
              <text class="poem-card-time">{{ formatTime(item.createdAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FloatingNav from '../../components/FloatingNav.vue'
import { API_BASE_URL } from '../../utils/api'

interface PoemRecord {
  id: string
  poem: { title: string; genre: string; content: string[]; translation: string; appreciation: string; rhyme: string }
  createdAt: string
}

const dailyRecommend = ref<PoemRecord>({
  id: 'daily',
  poem: {
    title: '题墨韵',
    genre: '七言绝句',
    rhyme: '东韵',
    content: ['笔落云烟气自雄，', '诗成锦绣意无穷。', '古今多少风流事，', '尽在毫端一卷中。'],
    translation: '笔锋落处如云烟般气势雄浑，诗句写成如锦绣般意境无穷。古往今来多少风流韵事，尽在这笔端的一卷诗书之中。',
    appreciation: '此诗以书写为题，歌颂诗词书法的魅力，末句将千古风流浓缩于毫端，豪气干云。',
  },
  createdAt: new Date().toISOString(),
})

const featured = ref<PoemRecord[]>([])

const leftColumn = computed(() => featured.value.filter((_, i) => i % 2 === 0))
const rightColumn = computed(() => featured.value.filter((_, i) => i % 2 === 1))

const cardTones = ['tone-cyan', 'tone-gold', 'tone-pink']

function getCardTone(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % cardTones.length
  return cardTones[hash]
}

async function loadFeatured() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/user/featured`)
    const data = await resp.json()
    if (data.success) featured.value = data.data.items
  } catch (_) {}
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function onViewPoem(item: PoemRecord) {
  uni.setStorageSync('moyun_nav_poem', JSON.stringify(item.poem))
  uni.navigateTo({ url: '/pages/result/result?from=storage' })
}

onMounted(() => loadFeatured())
</script>

<style lang="scss">
/* #ifdef H5 */
@import '@fontsource/ma-shan-zheng';
/* #endif */

.calligraphy {
  font-family: var(--ui-font);
}

.page {
  min-height: 100vh;
  background-color: var(--c-paper);
  padding: 0 32rpx 200rpx;
}

/* ── 头部 ── */
.header {
  padding: 96rpx 0 48rpx;
  text-align: center;
  position: relative;
}

.title {
  font-family: var(--ui-font);
  font-size: 72rpx;
  color: var(--c-ink);
  letter-spacing: 16rpx;
  display: block;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: var(--c-mountain);
  letter-spacing: 6rpx;
  margin-top: 12rpx;
}

.header-ornament {
  width: 48rpx;
  height: 4rpx;
  background: var(--c-vermilion);
  margin: 24rpx auto 0;
  border-radius: 2rpx;
  opacity: 0.6;
}

/* ── 今日推荐 ── */
.recommend-section {
  margin-bottom: 64rpx;
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.label-line {
  width: 40rpx;
  height: 1rpx;
  background: var(--c-ink-15);
}

.label-text {
  font-size: 22rpx;
  color: var(--c-mountain);
  letter-spacing: 4rpx;
}

.recommend-card {
  position: relative;
  border-radius: 4rpx;
  overflow: hidden;
  min-height: 480rpx;
  border: 2rpx solid var(--c-ink-08);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;

  &:hover {
    transform: translateY(-4rpx);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(0.99);
  }
}

.recommend-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #1a1a2e 0%, #2a2a42 40%, #1a1a2e 100%);
}

.recommend-bg::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 60%;
  height: 80%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--c-mountain) 25%, transparent) 0%, transparent 70%);
}

.recommend-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
}

.recommend-accent {
  position: absolute;
  top: 48rpx;
  right: 48rpx;
  width: 4rpx;
  height: 120rpx;
  background: var(--c-vermilion);
  border-radius: 2rpx;
  z-index: 2;
  opacity: 0.85;
}

.recommend-inner {
  position: relative;
  z-index: 1;
  padding: 56rpx 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recommend-title {
  font-size: 36rpx;
  color: var(--c-paper);
  letter-spacing: 4rpx;
  margin-bottom: 40rpx;
}

.vertical-poem {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  gap: 32rpx;
  min-height: 280rpx;
  padding: 0 24rpx;
}

.vertical-line {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 28rpx;
  color: color-mix(in srgb, var(--c-paper) 88%, transparent);
  letter-spacing: 6rpx;
  line-height: 1.6;
}

.recommend-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid color-mix(in srgb, var(--c-paper) 12%, transparent);
}

.recommend-genre {
  font-family: var(--ui-font);
  font-size: 22rpx;
  color: var(--c-gold);
  letter-spacing: 2rpx;
  padding: 6rpx 20rpx;
  border: 1rpx solid color-mix(in srgb, var(--c-gold) 40%, transparent);
  border-radius: 2rpx;
}

.recommend-hint {
  font-size: 22rpx;
  color: color-mix(in srgb, var(--c-paper) 45%, transparent);
}

/* ── 精选瀑布流 ── */
.section {
  margin-top: 16rpx;
}

.section-head {
  margin-bottom: 32rpx;
  padding-left: 8rpx;
}

.section-title {
  font-size: 44rpx;
  color: var(--c-ink);
  letter-spacing: 8rpx;
  display: block;
}

.section-desc {
  display: block;
  font-size: 22rpx;
  color: var(--c-mountain);
  margin-top: 8rpx;
  letter-spacing: 2rpx;
}

.empty-hint {
  text-align: center;
  padding: 100rpx 0 80rpx;
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  color: var(--c-ink-08);
  margin-bottom: 24rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: var(--c-mountain);
  letter-spacing: 4rpx;
}

.empty-sub {
  display: block;
  font-size: 22rpx;
  color: color-mix(in srgb, var(--c-mountain) 60%, transparent);
  margin-top: 16rpx;
}

.waterfall {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.waterfall-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.poem-card {
  border-radius: 4rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid var(--c-divider);
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2rpx;
    background: linear-gradient(90deg, transparent 10%, color-mix(in srgb, var(--c-vermilion) 30%, transparent) 50%, transparent 90%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: var(--c-ink-12);
    box-shadow: var(--shadow-md);

    &::before { opacity: 1; }
  }

  &:active {
    opacity: 0.9;
  }
}

.tone-cyan {
  background: linear-gradient(160deg, #eef3f6 0%, #f5f8fa 100%);
}

.tone-gold {
  background: linear-gradient(160deg, #faf5ea 0%, #fdf9f0 100%);
}

.tone-pink {
  background: linear-gradient(160deg, #faf0ed 0%, #fdf5f3 100%);
}

.poem-card-title {
  font-size: 32rpx;
  color: var(--c-ink);
  letter-spacing: 2rpx;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.poem-card-body {
  margin-bottom: 20rpx;
}

.poem-card-line {
  display: block;
  font-size: 24rpx;
  color: var(--c-ink-65);
  line-height: 1.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poem-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--c-divider);
}

.poem-card-badge {
  font-family: var(--ui-font);
  font-size: 20rpx;
  color: var(--c-mountain);
  background: color-mix(in srgb, var(--c-mountain) 8%, transparent);
  padding: 4rpx 14rpx;
  border: 1rpx solid color-mix(in srgb, var(--c-mountain) 15%, transparent);
  border-radius: 2rpx;
}

.poem-card-time {
  font-size: 20rpx;
  color: var(--c-ink-45);
}

/* ══ 深色模式覆盖 ══ */
:root[data-theme="dark"] {
  .page { background-color: var(--c-paper); }

  /* 头部 */
  .title { color: var(--c-ink); }
  .subtitle { color: var(--c-mountain); }
  .header-ornament { background: var(--c-vermilion); }

  /* 推荐卡 — 月夜暖光 */
  .recommend-card {
    border-color: rgba(212, 160, 23, 0.1);
    box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.3);
  }
  .recommend-bg {
    background: linear-gradient(145deg, #1a2535 0%, #1e3040 40%, #1a2535 100%) !important;
  }
  .recommend-bg::before {
    background: radial-gradient(ellipse, rgba(212, 160, 23, 0.1) 0%, transparent 70%) !important;
  }
  .recommend-bg::after {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent) !important;
  }
  .recommend-title { color: #f0ece6; }
  .vertical-line { color: rgba(240, 236, 230, 0.85); }
  .recommend-genre {
    color: var(--c-gold);
    border-color: rgba(212, 160, 23, 0.35);
  }
  .recommend-hint { color: rgba(240, 236, 230, 0.4); }
  .recommend-footer { border-top-color: rgba(240, 236, 230, 0.1); }

  /* 区块标题 */
  .section-title { color: var(--c-ink); }
  .section-desc { color: var(--c-mountain); }
  .label-text { color: var(--c-mountain); }
  .label-line { background: rgba(232, 228, 223, 0.12); }

  /* 诗词卡片 */
  .tone-cyan {
    background: linear-gradient(160deg, #1e2a32 0%, #222230 100%);
    border-color: rgba(232, 228, 223, 0.06);
  }
  .tone-gold {
    background: linear-gradient(160deg, #2a2518 0%, #222230 100%);
    border-color: rgba(232, 228, 223, 0.06);
  }
  .tone-pink {
    background: linear-gradient(160deg, #2a1e1c 0%, #222230 100%);
    border-color: rgba(232, 228, 223, 0.06);
  }
  .poem-card-title { color: var(--c-ink); }
  .poem-card-line { color: rgba(232, 228, 223, 0.6); }
  .poem-card-footer { border-top-color: rgba(232, 228, 223, 0.06); }
  .poem-card-badge {
    color: var(--c-mountain);
    background: rgba(122, 168, 194, 0.1);
    border-color: rgba(122, 168, 194, 0.15);
  }
  .poem-card-time { color: rgba(232, 228, 223, 0.3); }

  /* 空状态 */
  .empty-icon { color: rgba(232, 228, 223, 0.06); }
  .empty-text { color: var(--c-mountain); }
  .empty-sub { color: rgba(122, 168, 194, 0.5); }
}
</style>
