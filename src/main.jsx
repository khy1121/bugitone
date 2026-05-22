/*
 Entry point for the React application.
 - Mounts the top-level `App` component into the DOM element with id `root`.
 - Imports global SCSS which pulls in variables, mixins and reset styles.
*/
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.scss'
import registerServiceWorker from './registerServiceWorker'
import setVh from './utils/setVh'

// initialize --vh utility for mobile viewport sizing
setVh()
registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
