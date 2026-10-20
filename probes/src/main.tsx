import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@altics/ui'
import './index.css'
import App from './App.tsx'
import InputShowcase from './pages/InputShowcase.tsx'
import PopoverShowcase from './pages/PopoverShowcase.tsx'
import SheetParity from './pages/SheetParity.tsx'
import SelectShowcase from './pages/SelectShowcase.tsx'

const params = new URLSearchParams(window.location.search)
const page = params.get('page')

function Root() {
  const [dark, setDark] = useState(false)
  // ThemeProvider owns the theme for every page and sets the class on <html>.
  return (
    <ThemeProvider defaultTheme={dark ? 'dark' : 'light'}>
      {page === 'input' ? (
        <InputShowcase dark={dark} onToggleDark={() => setDark((v) => !v)} />
      ) : page === 'popover' ? (
        <PopoverShowcase dark={dark} onToggleDark={() => setDark((v) => !v)} />
      ) : page === 'sheet' ? (
        <SheetParity />
      ) : page === 'select' ? (
        <SelectShowcase />
      ) : (
        <App dark={dark} onToggleDark={() => setDark((v) => !v)} />
      )}
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
