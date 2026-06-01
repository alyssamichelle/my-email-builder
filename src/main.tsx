import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOTE: React.StrictMode is intentionally omitted. In dev it double-invokes
// effects (mount → unmount → remount), which races the Beefree SDK's
// imperative start/teardown and throws "Bee is not started", crashing the
// editor. The Builder wrapper manages its own lifecycle, so we render once.
createRoot(document.getElementById('root')!).render(<App />)
