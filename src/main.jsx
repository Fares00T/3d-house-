import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { teleport, setState, getState, pose } from './store.js'
import './styles.css'

if (import.meta.env.DEV) window.__app = { teleport, setState, getState, pose }

createRoot(document.getElementById('root')).render(<App />)
