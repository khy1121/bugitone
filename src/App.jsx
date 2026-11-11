import React from 'react'
import Router from './routes/Router'
import PwaUpdateNotice from './components/common/PwaUpdateNotice/PwaUpdateNotice'
import useVisualViewportHeight from './hooks/useVisualViewportHeight'

export default function App() {
  useVisualViewportHeight()

  return (
    <div className="viewport-wrapper">
      {/* 데스크탑(≥768px)에서만 핸드폰 모양으로 보이고, 모바일에서는 레이아웃에 영향 없음 */}
      <div className="device">
        <span className="device__deco device__button device__button--action" aria-hidden="true" />
        <span className="device__deco device__button device__button--volume-up" aria-hidden="true" />
        <span className="device__deco device__button device__button--volume-down" aria-hidden="true" />
        <span className="device__deco device__button device__button--power" aria-hidden="true" />
        <span className="device__deco device__island" aria-hidden="true" />
        <div className="app-frame">
          <Router />
        </div>
      </div>
      <PwaUpdateNotice />
    </div>
  )
}
