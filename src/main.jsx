import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import registerPwaUpdate from './pwa/registerPwaUpdate'
import './styles/global.scss'

registerPwaUpdate()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
