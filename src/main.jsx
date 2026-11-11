import React from 'react'
import { createRoot } from 'react-dom/client'
import './mock' // VITE_USE_MOCK=true 일 때만 더미 데이터 모드로 동작
import App from './App'
import registerPwaUpdate from './pwa/registerPwaUpdate'
import './styles/global.scss'

registerPwaUpdate()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
