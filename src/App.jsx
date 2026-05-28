import React from 'react'
import Router from './routes/Router'
import PwaUpdateNotice from './components/common/PwaUpdateNotice/PwaUpdateNotice'
import useVisualViewportHeight from './hooks/useVisualViewportHeight'

export default function App() {
  useVisualViewportHeight()

  return (
    <div className="viewport-wrapper">
      <div className="app-frame">
        <Router />
      </div>
      <PwaUpdateNotice />
    </div>
  )
}
