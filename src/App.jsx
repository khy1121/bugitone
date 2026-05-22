import React from 'react'
import Router from './routes/Router'

export default function App() {
  return (
    <div className="viewport-wrapper">
      <div className="app-frame">
        <Router />
      </div>
    </div>
  )
}
