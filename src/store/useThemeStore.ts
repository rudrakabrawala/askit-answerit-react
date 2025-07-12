import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme })
        updateThemeClass(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        updateThemeClass(newTheme)
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          updateThemeClass(state.theme)
        }
      }
    }
  )
)

const updateThemeClass = (theme: Theme) => {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      updateThemeClass(state.theme || 'light')
    } catch {
      updateThemeClass('light')
    }
  } else {
    updateThemeClass('light')
  }
}