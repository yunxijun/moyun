import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'moyun_theme'

const current = ref<ThemeMode>(
  (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'light'
)

function applyTheme(mode: ThemeMode) {
  // #ifdef H5
  document.documentElement.setAttribute('data-theme', mode)
  // #endif
}

// 初始化
applyTheme(current.value)

watch(current, (mode) => {
  localStorage.setItem(STORAGE_KEY, mode)
  applyTheme(mode)
})

export function useTheme() {
  function toggle() {
    current.value = current.value === 'light' ? 'dark' : 'light'
  }

  function set(mode: ThemeMode) {
    current.value = mode
  }

  return {
    theme: current,
    isDark: {
      get value() { return current.value === 'dark' },
    },
    toggle,
    set,
  }
}
