import React from 'react'
import Router from './routes/Router'
import useVisualViewportHeight from './hooks/useVisualViewportHeight'

export default function App() {
  useVisualViewportHeight()

  return (
    <div className="viewport-wrapper">
      <div className="app-frame">
        <Router />
      </div>
    </div>
  )
}
