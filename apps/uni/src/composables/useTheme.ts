import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'moyun_theme'

const current = ref<ThemeMode>(
  (uni.getStorageSync(STORAGE_KEY) as ThemeMode) || 'light'
)

function applyTheme(mode: ThemeMode) {
  // #ifdef H5
  document.documentElement.setAttribute('data-theme', mode)
  // #endif
}

// 初始化
applyTheme(current.value)

watch(current, (mode) => {
  uni.setStorageSync(STORAGE_KEY, mode)
  applyTheme(mode)
})

export function useTheme() {
  function toggle() {
    current.value = current.value === 'light' ? 'dark' : 'light'
  }

  function set(mode: ThemeMode) {
    current.value = mode
  }

  const isDark = computed(() => current.value === 'dark')

  return {
    theme: current,
    isDark,
    toggle,
    set,
  }
}
