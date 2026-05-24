'use client'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const toggle = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }
  const icons = {
    light: <Sun size={18} className="text-primary" />,
    dark: <Moon size={18} className="text-primary" />,
    system: <Monitor size={18} className="text-muted-foreground" />,
  }
  return (
    <button onClick={toggle}
      className="p-2.5 rounded-xl bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))]
                 hover:border-primary hover:bg-primary/10 transition-all duration-200">
      <AnimatePresence mode="wait">
        <motion.div key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}>
          {icons[theme]}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
