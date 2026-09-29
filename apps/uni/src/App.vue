<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import '@fontsource/ma-shan-zheng';

onLaunch(() => {
  console.log("App Launch");
  const uiFont = uni.getStorageSync('moyun_ui_font') || 'calligraphy'
  document.documentElement.setAttribute('data-ui-font', uiFont)
  const cursorStyle = uni.getStorageSync('moyun_cursor') || 'brush'
  document.documentElement.setAttribute('data-cursor', cursorStyle)
  initInkRipple()
});

function initInkRipple() {
  document.addEventListener('click', (e: MouseEvent) => {
    const x = e.clientX
    const y = e.clientY
    const ring = document.createElement('div')
    ring.className = 'ink-ripple-ring'
    ring.style.cssText = `left:${x}px;top:${y}px;`
    document.body.appendChild(ring)
    const cleanup = () => { if (ring.parentNode) ring.parentNode.removeChild(ring) }
    ring.addEventListener('animationend', cleanup)
    setTimeout(cleanup, 2000)
  })
}
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* ============================
   墨韵全局样式系统
   设计理念：水墨留白·诗意栖居
   ============================ */

/* -- 自定义鼠标：毛笔（可通过 data-cursor 切换） -- */
:root, [data-cursor="brush"] {
  --cursor-default: url('/static/cursor-brush.svg') 3 3, auto;
  --cursor-pointer: url('/static/cursor-brush.svg') 3 3, pointer;
}
[data-cursor="system"] {
  --cursor-default: auto;
  --cursor-pointer: pointer;
}

* {
  cursor: var(--cursor-default);
}

a, button, [class*="btn"], [class*="seal"], [class*="tag"], [class*="menu-item"],
[class*="card"], [class*="action"], [class*="selector"], [class*="nav-"],
[class*="option"], [class*="dropdown"], [class*="picker"],
[class*="stamp"], [class*="history"], [class*="poem-card"],
[class*="recommend"], [class*="daily"], .clickable {
  cursor: var(--cursor-pointer);
}

/* -- 全局色彩变量（浅色模式） -- */
:root, [data-theme="light"] {
  --c-ink: #1a1a2e;
  --c-paper: #faf8f3;
  --c-paper-deep: #f0e8d8;
  --c-paper-card: #fdfbf6;
  --c-vermilion: #c73e1d;
  --c-mountain: #5b7f95;
  --c-gold: #b8860b;
  --c-ink-06: rgba(26, 26, 46, 0.06);
  --c-ink-08: rgba(26, 26, 46, 0.08);
  --c-ink-12: rgba(26, 26, 46, 0.12);
  --c-ink-15: rgba(26, 26, 46, 0.15);
  --c-ink-25: rgba(26, 26, 46, 0.25);
  --c-ink-45: rgba(26, 26, 46, 0.45);
  --c-ink-65: rgba(26, 26, 46, 0.65);
  --c-ink-75: rgba(26, 26, 46, 0.75);
  --c-border: rgba(26, 26, 46, 0.08);
  --c-divider: rgba(26, 26, 46, 0.06);
  --c-overlay: rgba(250, 248, 243, 0.25);
  --shadow-sm: 0 2rpx 12rpx rgba(26, 26, 46, 0.04);
  --shadow-md: 0 8rpx 32rpx rgba(26, 26, 46, 0.08);
  --shadow-lg: 0 16rpx 48rpx rgba(26, 26, 46, 0.12);
}

/* -- 深色模式（月夜书房） -- */
[data-theme="dark"] {
  --c-ink: #e8e4df;
  --c-paper: #141820;
  --c-paper-deep: #0e1218;
  --c-paper-card: #1c2028;
  --c-vermilion: #e06040;
  --c-mountain: #7aa8c2;
  --c-gold: #d4a017;
  --c-ink-06: rgba(232, 228, 223, 0.06);
  --c-ink-08: rgba(232, 228, 223, 0.08);
  --c-ink-12: rgba(232, 228, 223, 0.12);
  --c-ink-15: rgba(232, 228, 223, 0.15);
  --c-ink-25: rgba(232, 228, 223, 0.25);
  --c-ink-45: rgba(232, 228, 223, 0.45);
  --c-ink-65: rgba(232, 228, 223, 0.65);
  --c-ink-75: rgba(232, 228, 223, 0.75);
  --c-border: rgba(232, 228, 223, 0.1);
  --c-divider: rgba(232, 228, 223, 0.06);
  --c-overlay: rgba(26, 26, 34, 0.4);
  --shadow-sm: 0 2rpx 12rpx rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 16rpx 48rpx rgba(0, 0, 0, 0.4);
}

/* 兼容旧变量名 */
:root {
  --ink: var(--c-ink);
  --paper: var(--c-paper);
  --vermillion: var(--c-vermilion);
  --mountain: var(--c-mountain);
  --gold: var(--c-gold);
  --ink-light: var(--c-ink-06);
  --ink-medium: var(--c-ink-15);
}

/* -- 全局 UI 字体 -- */
:root, [data-ui-font="calligraphy"] {
  --ui-font: 'Ma Shan Zheng', 'STKaiti', 'KaiTi', serif;
}
[data-ui-font="songti"] {
  --ui-font: 'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif;
}
[data-ui-font="system"] {
  --ui-font: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
}

/* -- 全局基础 -- */
page {
  background-color: var(--c-paper);
  font-family: var(--ui-font), 'PingFang SC', 'Microsoft YaHei', serif;
  color: var(--c-ink);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* -- 书法字体（跟随 UI 字体设置） -- */
.calligraphy {
  font-family: var(--ui-font);
}

/* -- 全局过渡 -- */
view, text, image, button, scroll-view {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* -- 墨晕点击反馈 -- */
.ink-ripple {
  position: relative;
  overflow: hidden;
}

.ink-ripple::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle, rgba(26, 26, 46, 0.08) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: all 0.5s ease;
  pointer-events: none;
}

.ink-ripple:active::after {
  opacity: 1;
  transform: scale(2);
  transition: 0s;
}

/* -- 渐入动画 -- */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes inkDrop {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-20rpx);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) translateY(0);
  }
  100% {
    opacity: 0.6;
    transform: scale(1) translateY(0);
  }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }

/* -- 表单元素重置（去除系统默认样式） -- */
input, textarea, select, button {
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  font-family: inherit;
  color: inherit;
}

textarea {
  resize: none;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: none;
}

/* uni-app H5 textarea 底部黑线 */
uni-textarea .uni-textarea-textarea,
.uni-textarea-textarea {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* -- 滚动条美化 -- */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--c-ink-12);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--c-ink-25);
}

/* -- 选中文字颜色 -- */
::selection {
  background: rgba(199, 62, 29, 0.15);
  color: var(--c-ink);
}

/* -- 水滴涟漪效果 -- */
.ink-ripple-ring {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(91, 127, 149, 0.4);
  background: transparent;
  opacity: 0;
  will-change: width, height, opacity;
  animation: rippleExpand 1.2s cubic-bezier(0.1, 0.5, 0.3, 1) both;
  animation-fill-mode: forwards;
  animation-iteration-count: 1;
}

@keyframes rippleExpand {
  0% {
    width: 8px;
    height: 8px;
    opacity: 0.6;
    border-width: 1.5px;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
    border-width: 0.5px;
  }
}

[data-theme="dark"] .ink-ripple-ring {
  border-color: rgba(122, 168, 194, 0.35);
}
</style>
