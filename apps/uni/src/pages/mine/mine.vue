<template>
  <view class="page">
    <!-- 水墨山水头部 -->
    <view class="profile-banner">
      <view class="mountain m1" />
      <view class="mountain m2" />
      <view class="mountain m3" />
      <view class="mist" />

      <view class="profile-header">
        <view class="avatar calligraphy" @tap="onPickAvatar">
          <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" mode="aspectFill" />
          <text v-else>墨</text>
          <view class="avatar-edit-hint">换</view>
        </view>
        <text class="nickname">{{ profile.nickname || '墨客' }}</text>
        <text class="membership">{{ profile.membership === 'free' ? '免费用户' : 'VIP会员' }}</text>
      </view>
    </view>

    <!-- 统计区 -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-num calligraphy">{{ totalPoems }}</text>
        <text class="stat-label">创作总数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num calligraphy">{{ shareCount }}</text>
        <text class="stat-label">分享创作</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num calligraphy">{{ favCount }}</text>
        <text class="stat-label">收藏总数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.key"
        class="menu-item"
        :class="{ 'menu-item--active': activeTab === item.key }"
        @tap="onMenuTap(item.key)"
      >
        <view class="menu-left">
          <view class="menu-dot" :class="item.dotClass" />
          <text class="menu-text">{{ item.label }}</text>
        </view>
        <text class="menu-arrow">{{ activeTab === item.key ? '−' : '›' }}</text>
      </view>
    </view>

    <!-- ═══ 内容区：创作历史 ═══ -->
    <view v-if="activeTab === 'history'" class="content-section">
      <view class="section-head">
        <view class="section-accent" />
        <text class="section-title calligraphy">创作历史</text>
        <text class="section-count">共 {{ history.length }} 首</text>
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

    <!-- ═══ 内容区：我的收藏 ═══ -->
    <view v-if="activeTab === 'favorite'" class="content-section">
      <view class="section-head">
        <view class="section-accent accent-gold" />
        <text class="section-title calligraphy">我的收藏</text>
        <text class="section-count">共 {{ favorites.length }} 首</text>
      </view>

      <view v-if="favorites.length === 0" class="empty-hint">
        <view class="empty-illustration">
          <text class="empty-char calligraphy">藏</text>
          <view class="empty-brush" />
        </view>
        <text class="empty-text">尚无收藏</text>
        <text class="empty-sub">在结果页点击「♡ 收藏」保存喜欢的诗词</text>
      </view>

      <view
        v-for="item in favorites"
        :key="item.id"
        class="history-card fav-card"
        @tap="onViewPoem(item)"
      >
        <view class="history-accent accent-gold-bg" />
        <view class="history-content">
          <view class="history-header">
            <text class="history-title calligraphy">《{{ item.poem.title }}》</text>
            <text class="history-genre">{{ item.poem.genre }}</text>
            <text class="fav-badge">♥</text>
          </view>
          <text class="history-preview">{{ item.poem.content.join('') }}</text>
          <view class="fav-footer">
            <text class="history-time">{{ formatTime(item.createdAt) }}</text>
            <text class="fav-remove" @tap.stop="onRemoveFavorite(item)">取消收藏</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ═══ 内容区：偏好设置 ═══ -->
    <view v-if="activeTab === 'settings'" class="content-section">
      <view class="section-head">
        <view class="section-accent accent-gray" />
        <text class="section-title calligraphy">偏好设置</text>
      </view>

      <view class="settings-panel">
        <!-- 主题 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">主题模式</text>
            <text class="setting-desc">切换深色/浅色外观</text>
          </view>
          <view class="setting-control">
            <view class="theme-toggle" :class="{ 'is-dark': isDark }" @tap="toggleTheme">
              <text class="theme-toggle-icon">{{ isDark ? '月' : '日' }}</text>
              <view class="theme-toggle-track">
                <view class="theme-toggle-thumb" />
              </view>
              <text class="theme-toggle-label">{{ isDark ? '深色' : '浅色' }}</text>
            </view>
          </view>
        </view>

        <!-- 鼠标样式 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">鼠标样式</text>
            <text class="setting-desc">自定义毛笔光标或系统默认</text>
          </view>
          <view class="setting-control ui-font-group">
            <text
              class="ui-font-btn"
              :class="{ 'ui-font-btn--active': cursorStyle === 'brush' }"
              @tap="onSetCursor('brush')"
            >毛笔</text>
            <text
              class="ui-font-btn"
              :class="{ 'ui-font-btn--active': cursorStyle === 'system' }"
              @tap="onSetCursor('system')"
            >系统</text>
          </view>
        </view>

        <!-- 界面字体 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">界面字体</text>
            <text class="setting-desc">网站整体显示风格</text>
          </view>
          <view class="setting-control ui-font-group">
            <text
              v-for="opt in uiFontOptions"
              :key="opt.key"
              class="ui-font-btn"
              :class="{ 'ui-font-btn--active': uiFont === opt.key }"
              :style="{ fontFamily: opt.preview }"
              @tap="onSetUiFont(opt.key)"
            >{{ opt.label }}</text>
          </view>
        </view>

        <!-- 默认书法字体 -->
        <view class="setting-item setting-item--col">
          <view class="setting-row" @tap="showFontPicker = !showFontPicker">
            <view class="setting-label">
              <text class="setting-name">默认书法字体</text>
              <text class="setting-desc">新建创作时的默认字体</text>
            </view>
            <view class="setting-control">
              <text class="setting-font-preview calligraphy-preview" :style="{ fontFamily: CALLIGRAPHY_FONTS[defaultFont].cssFontFamily }">墨韵</text>
              <text class="setting-font-name">{{ CALLIGRAPHY_FONTS[defaultFont].label }}</text>
              <text class="setting-chevron">{{ showFontPicker ? '−' : '›' }}</text>
            </view>
          </view>
          <view v-if="showFontPicker" class="font-picker">
            <view v-for="group in fontGroups" :key="group.scriptType" class="font-group">
              <text class="font-group-title">{{ group.label }}</text>
              <view class="font-group-list">
                <view
                  v-for="f in group.fonts"
                  :key="f.key"
                  class="font-option"
                  :class="{ 'font-option--active': defaultFont === f.key }"
                  @tap="onSelectFont(f.key as CalligraphyFont)"
                >
                  <text class="font-option-name">{{ f.label }}</text>
                  <text class="font-option-desc">{{ f.description }}</text>
                  <text v-if="defaultFont === f.key" class="font-option-check">✓</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 头像 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">头像</text>
            <text class="setting-desc">点击更换</text>
          </view>
          <view class="setting-control setting-avatar-ctl">
            <view class="setting-avatar-preview" @tap="onPickAvatar">
              <image v-if="avatarUrl" :src="avatarUrl" class="setting-avatar-img" mode="aspectFill" />
              <text v-else class="setting-avatar-placeholder">墨</text>
            </view>
            <text v-if="avatarUrl" class="setting-btn setting-btn--sm" @tap="removeAvatar">移除</text>
          </view>
        </view>

        <!-- 昵称 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">笔名</text>
            <text class="setting-desc">{{ editingNickname || profile.nickname || '墨客' }}</text>
          </view>
          <view class="setting-control">
            <input
              class="setting-input"
              :value="editingNickname"
              placeholder="输入你的笔名"
              maxlength="12"
              @input="(e: any) => editingNickname = e.detail?.value ?? e.target?.value ?? ''"
              @confirm="saveNickname"
            />
            <text class="setting-save" @tap="saveNickname">保存</text>
          </view>
        </view>

        <!-- 海报署名 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">海报署名</text>
            <text class="setting-desc">在分享海报底部展示头像和笔名</text>
          </view>
          <view class="setting-control">
            <view class="setting-toggle" :class="{ on: showAuthorInPoster }" @tap="togglePosterAuthor">
              <view class="setting-toggle-dot" />
            </view>
          </view>
        </view>

        <!-- 清除历史 -->
        <view class="setting-item setting-danger">
          <view class="setting-label">
            <text class="setting-name">清除创作历史</text>
            <text class="setting-desc">清除服务器上的全部历史记录</text>
          </view>
          <view class="setting-control">
            <text class="setting-btn setting-btn--danger" @tap="onClearHistory">清除</text>
          </view>
        </view>

        <!-- 清除收藏 -->
        <view class="setting-item setting-danger">
          <view class="setting-label">
            <text class="setting-name">清除收藏</text>
            <text class="setting-desc">清除本地保存的全部收藏</text>
          </view>
          <view class="setting-control">
            <text class="setting-btn setting-btn--danger" @tap="onClearFavorites">清除</text>
          </view>
        </view>

        <!-- 重置分享计数 -->
        <view class="setting-item">
          <view class="setting-label">
            <text class="setting-name">重置分享统计</text>
            <text class="setting-desc">当前已分享 {{ shareCount }} 次</text>
          </view>
          <view class="setting-control">
            <text class="setting-btn" @tap="onResetShareCount">重置</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ═══ 内容区：关于墨韵 ═══ -->
    <view v-if="activeTab === 'about'" class="content-section">
      <view class="section-head">
        <view class="section-accent accent-cyan" />
        <text class="section-title calligraphy">关于墨韵</text>
      </view>

      <view class="about-panel">
        <view class="about-logo">
          <view class="about-logo-circle calligraphy">
            <text>墨韵</text>
          </view>
          <text class="about-version">v0.1.0</text>
        </view>

        <view class="about-desc">
          <text class="about-text">
            墨韵 MoYun —— AI 诗词书法创作平台。
          </text>
          <text class="about-text">
            输入一个主题或心境，AI 即刻为你赋诗，
            再以数十种经典书法字体渲染成精美书法卡片。
          </text>
          <text class="about-text">
            支持竖排排版、多种装裱风格、宣纸纹理、
            印章落款，匠心复现传统书法之美。
          </text>
        </view>

        <view class="about-features">
          <view class="about-feature">
            <text class="about-feature-icon calligraphy">诗</text>
            <text class="about-feature-text">AI 格律诗词生成（五绝/七绝/五律/七律/词）</text>
          </view>
          <view class="about-feature">
            <text class="about-feature-icon calligraphy">书</text>
            <text class="about-feature-text">30+ 种经典书法字体渲染</text>
          </view>
          <view class="about-feature">
            <text class="about-feature-icon calligraphy">画</text>
            <text class="about-feature-text">宣纸纹理 · 装裱样式 · 印章落款</text>
          </view>
          <view class="about-feature">
            <text class="about-feature-icon calligraphy">藏</text>
            <text class="about-feature-text">高清导出 · 一键分享 · 收藏管理</text>
          </view>
        </view>

        <view class="about-credits">
          <text class="about-credit-title calligraphy">鸣谢</text>
          <text class="about-credit-item">· 书法字体：方正字库、文悦字库、Zeoseven 等</text>
          <text class="about-credit-item">· AI 引擎：DeepSeek / Qwen 大语言模型</text>
          <text class="about-credit-item">· 框架：Vue 3 + uni-app + Hono.js</text>
        </view>

        <view class="about-footer">
          <text class="about-copyright">© 2026 墨韵 MoYun · moyun.art</text>
          <text class="about-slogan calligraphy">笔墨有韵，诗词无界</text>
        </view>
      </view>
    </view>

    <FloatingNav />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import FloatingNav from '../../components/FloatingNav.vue'
import { useTheme } from '../../composables/useTheme'
import { CALLIGRAPHY_FONTS, getFontsByScript } from '@moyun/core'
import type { CalligraphyFont } from '@moyun/core'
import { API_BASE_URL } from '../../utils/api'

interface PoemRecord {
  id: string
  poem: { title: string; genre: string; content: string[]; translation: string; appreciation: string; rhyme: string }
  createdAt: string
  font?: string
  mount?: string
}

const { theme, isDark, toggle: toggleTheme } = useTheme()
const FAVORITES_KEY = 'moyun_favorites'
const SHARE_COUNT_KEY = 'moyun_share_count'
const NICKNAME_KEY = 'moyun_nickname'
const DEFAULT_FONT_KEY = 'moyun_default_font'
const AVATAR_KEY = 'moyun_avatar'
const POSTER_AUTHOR_KEY = 'moyun_poster_author'

const profile = ref<any>({})
const history = ref<PoemRecord[]>([])
const favorites = ref<PoemRecord[]>([])
const shareCount = ref(0)
const activeTab = ref('history')
const editingNickname = ref('')
const avatarUrl = ref(uni.getStorageSync(AVATAR_KEY) || '')
const showAuthorInPoster = ref(uni.getStorageSync(POSTER_AUTHOR_KEY) !== 'false')

function onPickAvatar() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      uni.showToast({ title: '图片不超过 2MB', icon: 'none' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      // 裁切为正方形并压缩
      const img = new Image()
      img.onload = () => {
        const size = Math.min(img.width, img.height, 400)
        const c = document.createElement('canvas')
        c.width = size; c.height = size
        const ctx = c.getContext('2d')!
        const sx = (img.width - size) / 2, sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
        const dataUrl = c.toDataURL('image/jpeg', 0.85)
        avatarUrl.value = dataUrl
        uni.setStorageSync(AVATAR_KEY, dataUrl)
        uni.showToast({ title: '头像已更新', icon: 'success' })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function removeAvatar() {
  avatarUrl.value = ''
  uni.removeStorageSync(AVATAR_KEY)
  uni.showToast({ title: '头像已移除', icon: 'none' })
}

function togglePosterAuthor() {
  showAuthorInPoster.value = !showAuthorInPoster.value
  uni.setStorageSync(POSTER_AUTHOR_KEY, showAuthorInPoster.value ? 'true' : 'false')
}
const defaultFont = ref<CalligraphyFont>((uni.getStorageSync(DEFAULT_FONT_KEY) as CalligraphyFont) || 'MaShanZheng')
const showFontPicker = ref(false)
const fontGroups = getFontsByScript()

type CursorStyle = 'brush' | 'system'
const cursorStyle = ref<CursorStyle>((uni.getStorageSync('moyun_cursor') as CursorStyle) || 'brush')

function onSetCursor(style: CursorStyle) {
  cursorStyle.value = style
  uni.setStorageSync('moyun_cursor', style)
  document.documentElement.setAttribute('data-cursor', style)
}

type UiFontKey = 'calligraphy' | 'songti' | 'system'
const uiFont = ref<UiFontKey>((uni.getStorageSync('moyun_ui_font') as UiFontKey) || 'calligraphy')
const uiFontOptions: { key: UiFontKey; label: string; preview: string }[] = [
  { key: 'calligraphy', label: '书法', preview: "'Ma Shan Zheng', serif" },
  { key: 'songti', label: '宋体', preview: "'Noto Serif SC', 'STSong', serif" },
  { key: 'system', label: '系统', preview: "-apple-system, 'PingFang SC', sans-serif" },
]

const menuItems = [
  { key: 'history', label: '创作历史', dotClass: 'dot-green' },
  { key: 'favorite', label: '我的收藏', dotClass: 'dot-gold' },
  { key: 'settings', label: '偏好设置', dotClass: 'dot-gray' },
  { key: 'about', label: '关于墨韵', dotClass: 'dot-cyan' },
]

const totalPoems = computed(() => profile.value.stats?.totalPoems ?? history.value.length)
const favCount = computed(() => favorites.value.length)

function getVisitorId(): string {
  return uni.getStorageSync('moyun_visitor_id') || 'anonymous'
}

/* ── 数据加载 ── */
async function loadProfile() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: { 'x-visitor-id': getVisitorId() },
    })
    const data = await resp.json()
    if (data.success) {
      profile.value = data.data
      const savedNick = uni.getStorageSync(NICKNAME_KEY)
      if (savedNick) profile.value.nickname = savedNick
    }
  } catch (_) {
    const savedNick = uni.getStorageSync(NICKNAME_KEY)
    if (savedNick) profile.value = { ...profile.value, nickname: savedNick }
  }
}

async function loadHistory() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/user/history`, {
      headers: { 'x-visitor-id': getVisitorId() },
    })
    const data = await resp.json()
    if (data.success) history.value = data.data.items
  } catch (_) {}
}

function loadFavorites() {
  try {
    favorites.value = JSON.parse(uni.getStorageSync(FAVORITES_KEY) || '[]')
  } catch { favorites.value = [] }
}

function loadShareCount() {
  shareCount.value = Number(uni.getStorageSync(SHARE_COUNT_KEY) || '0')
}

function loadAll() {
  loadProfile()
  loadHistory()
  loadFavorites()
  loadShareCount()
  editingNickname.value = uni.getStorageSync(NICKNAME_KEY) || ''
}

/* ── 菜单 ── */
function onMenuTap(key: string) {
  activeTab.value = activeTab.value === key ? '' : key
}

/* ── 查看诗词 ── */
function onViewPoem(item: PoemRecord) {
  uni.setStorageSync('moyun_nav_poem', JSON.stringify(item.poem))
  uni.navigateTo({ url: '/pages/result/result?from=storage' })
}

/* ── 收藏管理 ── */
function onRemoveFavorite(item: PoemRecord) {
  const idx = favorites.value.findIndex(f => f.id === item.id)
  if (idx >= 0) {
    favorites.value.splice(idx, 1)
    uni.setStorageSync(FAVORITES_KEY, JSON.stringify(favorites.value))
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  }
}

/* ── 设置 ── */
function saveNickname() {
  const name = editingNickname.value.trim()
  if (!name) {
    uni.showToast({ title: '笔名不能为空', icon: 'none' })
    return
  }
  uni.setStorageSync(NICKNAME_KEY, name)
  profile.value = { ...profile.value, nickname: name }
  uni.showToast({ title: '笔名已保存', icon: 'success' })
}

function onClearHistory() {
  uni.showModal({
    title: '确认清除',
    content: '清除后创作历史将无法恢复，确定继续？',
    confirmColor: '#c05040',
    success(res) {
      if (res.confirm) {
        history.value = []
        uni.showToast({ title: '历史已清除', icon: 'success' })
      }
    },
  })
}

function onClearFavorites() {
  uni.showModal({
    title: '确认清除',
    content: '清除后收藏列表将无法恢复，确定继续？',
    confirmColor: '#c05040',
    success(res) {
      if (res.confirm) {
        favorites.value = []
        uni.setStorageSync(FAVORITES_KEY, '[]')
        uni.showToast({ title: '收藏已清除', icon: 'success' })
      }
    },
  })
}

function onResetShareCount() {
  uni.setStorageSync(SHARE_COUNT_KEY, '0')
  shareCount.value = 0
  uni.showToast({ title: '已重置', icon: 'success' })
}

function onSetUiFont(key: UiFontKey) {
  uiFont.value = key
  uni.setStorageSync('moyun_ui_font', key)
  document.documentElement.setAttribute('data-ui-font', key)
}

function onSelectFont(key: CalligraphyFont) {
  defaultFont.value = key
  uni.setStorageSync(DEFAULT_FONT_KEY, key)
  showFontPicker.value = false
  uni.showToast({ title: `已设为 ${CALLIGRAPHY_FONTS[key].label}`, icon: 'success' })
}

/* ── 时间格式 ── */
function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(loadAll)
onActivated(loadAll)
</script>

<style lang="scss">
@import '@fontsource/ma-shan-zheng';

$color-vermilion: #c05040;
$color-mountain: #7aa8c2;
$color-gold: #b8963e;

.calligraphy { font-family: var(--ui-font); }

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
.mountain { position: absolute; bottom: 60rpx; border-radius: 50% 50% 0 0; }
.m1 { left: -10%; width: 55%; height: 200rpx; background: var(--c-ink-25); }
.m2 { left: 25%; width: 50%; height: 260rpx; background: var(--c-ink-12); }
.m3 { right: -5%; width: 45%; height: 180rpx; background: var(--c-ink-25); }
.mist {
  position: absolute; bottom: 80rpx; left: 0; right: 0; height: 80rpx;
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--c-paper) 60%, transparent));
}

.profile-header {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  padding-top: 72rpx;
}
.avatar {
  width: 128rpx; height: 128rpx; border-radius: 50%;
  background: var(--c-paper-card); display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md); margin-bottom: 20rpx;
  position: relative; overflow: hidden; cursor: pointer;
  text { font-size: 56rpx; color: var(--c-ink); line-height: 1; }
}
.avatar-img {
  width: 100%; height: 100%; border-radius: 50%;
}
.avatar-edit-hint {
  position: absolute; bottom: 0; left: 0; right: 0;
  text-align: center; font-size: 18rpx; color: #fff;
  background: rgba(0,0,0,0.45); padding: 2rpx 0;
  opacity: 0; transition: opacity 0.2s;
}
.avatar:hover .avatar-edit-hint,
.avatar:active .avatar-edit-hint { opacity: 1; }

.setting-avatar-ctl {
  display: flex; align-items: center; gap: 12px;
}
.setting-avatar-preview {
  width: 48px; height: 48px; border-radius: 50%;
  overflow: hidden; cursor: pointer;
  background: var(--c-ink-06);
  display: flex; align-items: center; justify-content: center;
}
.setting-avatar-img {
  width: 48px; height: 48px;
}
.setting-avatar-placeholder {
  font-size: 24px; color: var(--c-ink-35);
}
.setting-btn--sm {
  font-size: 12px !important; padding: 4px 10px !important;
}
.setting-toggle {
  width: 44px; height: 24px; border-radius: 12px;
  background: var(--c-ink-12); cursor: pointer;
  position: relative; transition: background 0.3s;
  &.on { background: #5b7f95; }
}
.setting-toggle-dot {
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; position: absolute; top: 2px; left: 2px;
  transition: transform 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  .setting-toggle.on & { transform: translateX(20px); }
}
.nickname {
  font-size: 36rpx; font-weight: 600; color: var(--c-paper);
  letter-spacing: 6rpx; text-shadow: 0 2rpx 8rpx var(--c-ink-25);
}
.membership {
  font-family: var(--ui-font);
  font-size: 22rpx; color: color-mix(in srgb, var(--c-paper) 80%, transparent);
  margin-top: 10rpx; letter-spacing: 4rpx; padding: 4rpx 24rpx;
  border: 1rpx solid color-mix(in srgb, var(--c-paper) 30%, transparent); border-radius: 2rpx;
}

/* ── 统计区 ── */
.stats-row {
  display: flex; align-items: center; justify-content: center;
  margin: -48rpx 32rpx 40rpx; padding: 40rpx 0;
  background: var(--c-paper-card); border: 1rpx solid var(--c-divider); border-radius: 4rpx;
  box-shadow: var(--shadow-sm); position: relative; z-index: 3;
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.stat-num { font-size: 52rpx; color: var(--c-ink); line-height: 1; writing-mode: horizontal-tb; }
.stat-label { font-size: 20rpx; color: var(--c-mountain); letter-spacing: 2rpx; }
.stat-divider { width: 1rpx; height: 56rpx; background: var(--c-ink-12); }

/* ── 功能菜单 ── */
.menu-section {
  margin: 0 32rpx 40rpx;
  background: linear-gradient(180deg, var(--c-paper-card), var(--c-paper));
  background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, var(--c-ink-06) 3px, var(--c-ink-06) 4px);
  border: 1rpx solid var(--c-border); border-top: 3rpx solid color-mix(in srgb, $color-vermilion 30%, transparent);
  border-radius: 4rpx; overflow: hidden; box-shadow: var(--shadow-sm);
}
.menu-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 32rpx 28rpx; border-bottom: 1rpx solid var(--c-divider);
  transition: background 0.25s ease, padding-left 0.25s ease;
  cursor: pointer;
  &:hover { background: var(--c-ink-06); padding-left: 36rpx; }
  &:active { background: var(--c-ink-08); }
  &:last-child { border-bottom: none; }
  &--active {
    background: var(--c-ink-06);
    .menu-text { color: $color-vermilion; }
    .menu-arrow { color: var(--c-ink-45); }
  }
}
.menu-left { display: flex; align-items: center; gap: 20rpx; }
.menu-dot { width: 14rpx; height: 14rpx; border-radius: 2rpx; flex-shrink: 0; }
.dot-green { background: #5a9a6f; }
.dot-gold { background: $color-gold; }
.dot-gray { background: #8a8a9a; }
.dot-cyan { background: $color-mountain; }
.menu-text {
  font-family: var(--ui-font);
  font-size: 30rpx; color: var(--c-ink); letter-spacing: 4rpx;
  transition: color 0.25s;
}
.menu-arrow {
  font-family: var(--ui-font); color: var(--c-ink-15); font-size: 28rpx;
  transition: color 0.25s ease, transform 0.25s ease;
}

/* ── 内容区公共 ── */
.content-section {
  padding: 0 32rpx;
  animation: fadeSlideIn 0.35s ease;
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.section-head {
  display: flex; align-items: center; gap: 16rpx; margin-bottom: 28rpx;
}
.section-accent { width: 4rpx; height: 36rpx; background: $color-vermilion; border-radius: 2rpx; }
.accent-gold { background: $color-gold; }
.accent-gray { background: #8a8a9a; }
.accent-cyan { background: $color-mountain; }
.section-title { font-size: 40rpx; color: var(--c-ink); letter-spacing: 8rpx; }
.section-count {
  font-size: 22rpx; color: var(--c-ink-45); margin-left: auto;
  letter-spacing: 2rpx;
}

/* ── 空状态 ── */
.empty-hint { text-align: center; padding: 80rpx 0 60rpx; }
.empty-illustration {
  position: relative; width: 160rpx; height: 160rpx; margin: 0 auto 32rpx;
  display: flex; align-items: center; justify-content: center;
}
.empty-char { font-size: 100rpx; color: var(--c-ink-06); }
.empty-brush {
  position: absolute; bottom: 20rpx; right: 10rpx; width: 60rpx; height: 4rpx;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, $color-vermilion 30%, transparent));
  transform: rotate(-25deg); border-radius: 2rpx;
}
.empty-text { display: block; font-size: 28rpx; color: var(--c-mountain); letter-spacing: 6rpx; }
.empty-sub { display: block; font-size: 22rpx; color: color-mix(in srgb, var(--c-mountain) 60%, transparent); margin-top: 16rpx; }

/* ── 历史/收藏卡片 ── */
.history-card {
  display: flex; background: linear-gradient(180deg, var(--c-paper-card), var(--c-paper));
  border: 1rpx solid var(--c-divider); border-radius: 4rpx; margin-bottom: 20rpx; overflow: hidden;
  box-shadow: var(--shadow-sm); transition: border-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  &:hover { border-color: var(--c-ink-12); box-shadow: var(--shadow-md); }
  &:active { opacity: 0.9; }
}
.fav-card .history-accent { background: $color-gold; }
.history-accent { width: 6rpx; flex-shrink: 0; background: $color-vermilion; opacity: 0.7; }
.accent-gold-bg { background: $color-gold !important; }
.history-content { flex: 1; padding: 28rpx 24rpx; }
.history-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 12rpx; }
.history-title { font-size: 30rpx; color: var(--c-ink); letter-spacing: 2rpx; }
.history-genre {
  font-family: var(--ui-font); font-size: 20rpx; color: var(--c-mountain);
  background: color-mix(in srgb, var(--c-mountain) 8%, transparent);
  padding: 4rpx 14rpx; border: 1rpx solid color-mix(in srgb, var(--c-mountain) 15%, transparent); border-radius: 2rpx;
}
.fav-badge { color: $color-vermilion; font-size: 22rpx; margin-left: auto; }
.history-preview {
  font-size: 26rpx; color: var(--c-ink-65); line-height: 1.7;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.history-time { display: block; font-size: 20rpx; color: var(--c-ink-45); margin-top: 16rpx; }
.fav-footer {
  display: flex; align-items: center; justify-content: space-between; margin-top: 16rpx;
}
.fav-remove {
  font-family: var(--ui-font);
  font-size: 22rpx; color: var(--c-ink-45); letter-spacing: 2rpx;
  padding: 4rpx 16rpx; border: 1rpx solid var(--c-ink-12); border-radius: 2rpx;
  cursor: pointer; transition: color 0.2s, border-color 0.2s;
  &:hover { color: $color-vermilion; border-color: $color-vermilion; }
}

/* ── 偏好设置 ── */
.settings-panel {
  background: var(--c-paper-card); border: 1rpx solid var(--c-border); border-radius: 4rpx;
  overflow: hidden; box-shadow: var(--shadow-sm);
}
.setting-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 28rpx 28rpx; border-bottom: 1rpx solid var(--c-divider);
  &:last-child { border-bottom: none; }
}
.setting-label { flex: 1; min-width: 0; }
.setting-name { display: block; font-size: 28rpx; color: var(--c-ink); letter-spacing: 2rpx; }
.setting-desc {
  display: block; font-size: 22rpx; color: var(--c-ink-45); margin-top: 6rpx;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.setting-control { display: flex; align-items: center; gap: 12rpx; flex-shrink: 0; margin-left: 20rpx; }

/* 主题开关 */
.theme-toggle {
  display: flex; align-items: center; gap: 12rpx; cursor: pointer;
  user-select: none;
}
.theme-toggle-icon {
  font-family: var(--ui-font);
  font-size: 28rpx; color: var(--c-ink); width: 32rpx; text-align: center;
}
.theme-toggle-track {
  width: 72rpx; height: 36rpx; border-radius: 18rpx;
  background: var(--c-ink-12); position: relative; transition: background 0.3s;
}
.is-dark .theme-toggle-track { background: $color-mountain; }
.theme-toggle-thumb {
  position: absolute; top: 4rpx; left: 4rpx;
  width: 28rpx; height: 28rpx; border-radius: 50%;
  background: var(--c-paper); box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.15);
  transition: transform 0.3s;
}
.is-dark .theme-toggle-thumb { transform: translateX(36rpx); }
.theme-toggle-label {
  font-size: 22rpx; color: var(--c-ink-65); letter-spacing: 2rpx; width: 48rpx;
}

/* 输入框 */
.setting-input {
  width: 200rpx; height: 56rpx; border: 1rpx solid var(--c-ink-12); border-radius: 4rpx;
  padding: 0 16rpx; font-size: 24rpx; color: var(--c-ink);
  background: var(--c-paper); transition: border-color 0.2s;
  &:focus { border-color: $color-mountain; }
}
.setting-save {
  font-family: var(--ui-font);
  font-size: 24rpx; color: var(--c-paper); background: $color-mountain;
  padding: 8rpx 24rpx; border-radius: 4rpx; cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
}

/* 操作按钮 */
.setting-btn {
  font-family: var(--ui-font);
  font-size: 24rpx; color: var(--c-ink-65); letter-spacing: 2rpx;
  padding: 8rpx 24rpx; border: 1rpx solid var(--c-ink-12); border-radius: 4rpx;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: var(--c-ink-06); }
  &--danger {
    color: $color-vermilion; border-color: color-mix(in srgb, $color-vermilion 30%, transparent);
    &:hover { background: color-mix(in srgb, $color-vermilion 8%, transparent); }
  }
}

/* ── 界面字体切换 ── */
.ui-font-group { gap: 8rpx; }
.ui-font-btn {
  padding: 8rpx 20rpx; border: 1rpx solid var(--c-ink-12); border-radius: 4rpx;
  font-size: 24rpx; color: var(--c-ink-65); letter-spacing: 2rpx;
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: var(--c-mountain); }
  &--active {
    color: var(--c-paper); background: $color-mountain; border-color: $color-mountain;
  }
}

/* ── 字体选择器 ── */
.setting-item--col { flex-direction: column; align-items: stretch; padding: 0; }
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 28rpx 28rpx; cursor: pointer;
  transition: background 0.2s;
  &:hover { background: var(--c-ink-06); }
}
.setting-font-preview {
  font-size: 28rpx; color: var(--c-ink); margin-right: 12rpx;
}
.setting-font-name {
  font-family: var(--ui-font);
  font-size: 24rpx; color: var(--c-mountain); margin-right: 8rpx;
}
.setting-chevron {
  font-size: 28rpx; color: var(--c-ink-25); transition: transform 0.2s;
}
.font-picker {
  border-top: 1rpx solid var(--c-divider); padding: 16rpx 28rpx 24rpx;
  max-height: 600rpx; overflow-y: auto;
  animation: fadeSlideIn 0.25s ease;
}
.font-group { margin-bottom: 20rpx; }
.font-group-title {
  font-family: var(--ui-font);
  font-size: 24rpx; color: var(--c-mountain); letter-spacing: 4rpx;
  display: block; margin-bottom: 12rpx;
  padding-bottom: 8rpx; border-bottom: 1rpx solid var(--c-ink-06);
}
.font-group-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.font-option {
  position: relative;
  padding: 12rpx 20rpx; border: 1rpx solid var(--c-ink-12); border-radius: 4rpx;
  cursor: pointer; transition: all 0.2s; min-width: 140rpx;
  &:hover { border-color: var(--c-mountain); background: var(--c-ink-06); }
  &--active {
    border-color: $color-vermilion;
    background: color-mix(in srgb, $color-vermilion 6%, transparent);
  }
}
.font-option-name { display: block; font-size: 24rpx; color: var(--c-ink); letter-spacing: 1rpx; }
.font-option-desc {
  display: block; font-size: 18rpx; color: var(--c-ink-45); margin-top: 4rpx;
  max-width: 280rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.font-option-check {
  position: absolute; top: 8rpx; right: 12rpx;
  font-size: 22rpx; color: $color-vermilion; font-weight: 700;
}

/* ── 关于墨韵 ── */
.about-panel { padding: 0 4rpx; }
.about-logo {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 48rpx;
}
.about-logo-circle {
  width: 160rpx; height: 160rpx; border-radius: 50%;
  background: var(--c-paper-card); border: 2rpx solid var(--c-divider);
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md); margin-bottom: 20rpx;
  text { font-size: 44rpx; color: var(--c-ink); letter-spacing: 4rpx; }
}
.about-version {
  font-size: 22rpx; color: var(--c-ink-45); letter-spacing: 2rpx;
}
.about-desc { margin-bottom: 40rpx; }
.about-text {
  display: block; font-size: 26rpx; color: var(--c-ink-75); line-height: 2;
  letter-spacing: 1rpx; text-indent: 2em;
}
.about-features {
  background: var(--c-paper-card); border: 1rpx solid var(--c-divider); border-radius: 4rpx;
  padding: 8rpx 0; margin-bottom: 40rpx; box-shadow: var(--shadow-sm);
}
.about-feature {
  display: flex; align-items: center; gap: 20rpx; padding: 24rpx 28rpx;
  border-bottom: 1rpx solid var(--c-divider);
  &:last-child { border-bottom: none; }
}
.about-feature-icon {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: color-mix(in srgb, $color-vermilion 8%, transparent);
  color: $color-vermilion; font-size: 28rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.about-feature-text { font-size: 24rpx; color: var(--c-ink-65); letter-spacing: 1rpx; line-height: 1.6; }

.about-credits {
  background: var(--c-paper-card); border: 1rpx solid var(--c-divider); border-radius: 4rpx;
  padding: 24rpx 28rpx; margin-bottom: 40rpx; box-shadow: var(--shadow-sm);
}
.about-credit-title {
  display: block; font-size: 30rpx; color: var(--c-ink); letter-spacing: 4rpx; margin-bottom: 16rpx;
}
.about-credit-item {
  display: block; font-size: 22rpx; color: var(--c-ink-45); line-height: 2; letter-spacing: 1rpx;
}
.about-footer { text-align: center; padding: 40rpx 0 20rpx; }
.about-copyright { display: block; font-size: 20rpx; color: var(--c-ink-25); letter-spacing: 2rpx; }
.about-slogan {
  display: block; font-size: 32rpx; color: var(--c-ink-25); margin-top: 16rpx; letter-spacing: 8rpx;
}

/* ══ 深色模式覆盖 ══ */
:root[data-theme="dark"] {
  .profile-banner {
    background: linear-gradient(180deg, #2a3a45 0%, #1e2e38 35%, #3a5060 65%, var(--c-paper) 100%);
  }
  .mountain { opacity: 0.6; }
  .nickname { color: #f0ece6; }
  .membership { color: rgba(240, 236, 230, 0.75); border-color: rgba(240, 236, 230, 0.25); }
  .avatar {
    background: var(--c-paper-card); box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
    text { color: var(--c-ink); }
  }
  .stats-row {
    background: var(--c-paper-card) !important;
    border-color: rgba(232, 228, 223, 0.06); box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);
  }
  .stat-num { color: var(--c-ink); }
  .stat-divider { background: rgba(232, 228, 223, 0.08); }
  .menu-section {
    background: var(--c-paper-card) !important; background-image: none !important;
    border-color: rgba(232, 228, 223, 0.06); border-top-color: rgba(224, 96, 64, 0.35);
  }
  .menu-item {
    border-bottom-color: rgba(232, 228, 223, 0.04);
    &:hover { background: rgba(232, 228, 223, 0.04); }
  }
  .menu-text { color: var(--c-ink); }
  .menu-arrow { color: rgba(232, 228, 223, 0.15); }
  .history-card {
    background: var(--c-paper-card) !important; border-color: rgba(232, 228, 223, 0.06);
    &:hover { border-color: rgba(232, 228, 223, 0.12); }
  }
  .history-title { color: var(--c-ink); }
  .history-genre { color: var(--c-mountain); background: rgba(122, 168, 194, 0.1); border-color: rgba(122, 168, 194, 0.15); }
  .history-preview { color: rgba(232, 228, 223, 0.5); }
  .history-time { color: rgba(232, 228, 223, 0.25); }
  .empty-char { color: rgba(232, 228, 223, 0.06); }
  .settings-panel { background: var(--c-paper-card) !important; border-color: rgba(232, 228, 223, 0.06); }
  .setting-item { border-bottom-color: rgba(232, 228, 223, 0.04); }
  .setting-name { color: var(--c-ink); }
  .setting-input { background: var(--c-paper); border-color: rgba(232, 228, 223, 0.1); color: var(--c-ink); }
  .about-logo-circle { background: var(--c-paper-card); border-color: rgba(232, 228, 223, 0.08); }
  .about-features, .about-credits { background: var(--c-paper-card) !important; border-color: rgba(232, 228, 223, 0.06); }
  .about-feature { border-bottom-color: rgba(232, 228, 223, 0.04); }
  .font-picker { border-top-color: rgba(232, 228, 223, 0.06); }
  .font-group-title { border-bottom-color: rgba(232, 228, 223, 0.04); }
  .font-option {
    border-color: rgba(232, 228, 223, 0.08);
    &:hover { border-color: $color-mountain; background: rgba(232, 228, 223, 0.04); }
    &--active { border-color: $color-vermilion; background: rgba(224, 96, 64, 0.08); }
  }
  .font-option-name { color: var(--c-ink); }
}
</style>
