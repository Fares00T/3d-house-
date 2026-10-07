import { useEffect, useState } from 'react'
import { useStore, setState, getState, teleport } from '../store.js'
import { ROOMS, START } from '../plan.js'
import Minimap from './Minimap.jsx'

const yawTo = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z))

function RoomBadge() {
  const roomId = useStore((s) => s.room)
  const room = ROOMS.find((r) => r.id === roomId)
  if (!room) return null
  return (
    <div className="badge" aria-live="polite">
      <span className="tag">{room.code}</span>
      <div className="badge__text">
        <strong>{room.name}</strong>
        <span>{room.area} m²</span>
      </div>
    </div>
  )
}

function ModeSwitch() {
  const mode = useStore((s) => s.mode)
  const items = [
    ['walk', 'Walk'],
    ['tour', 'Guided tour'],
    ['overview', 'Dollhouse'],
  ]
  return (
    <div className="modes" role="tablist" aria-label="View mode">
      {items.map(([id, label]) => (
        <button
          key={id}
          role="tab"
          aria-selected={mode === id}
          className={mode === id ? 'is-on' : ''}
          onClick={() => setState({ mode: id, caption: null, tourProgress: 0 })}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Settings() {
  const time = useStore((s) => s.time)
  const quality = useStore((s) => s.quality)
  const [fs, setFs] = useState(false)
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  return (
    <div className="settings">
      <div className="seg" role="group" aria-label="Lighting">
        <button className={time === 'day' ? 'is-on' : ''} onClick={() => setState({ time: 'day' })}>
          Day
        </button>
        <button className={time === 'night' ? 'is-on' : ''} onClick={() => setState({ time: 'night' })}>
          Evening
        </button>
      </div>
      <button
        className="chip"
        onClick={() => setState({ quality: quality === 'high' ? 'low' : 'high' })}
        title="Ambient occlusion, bloom and sharper shadows"
      >
        {quality === 'high' ? 'High quality' : 'Fast mode'}
      </button>
      {document.fullscreenEnabled && (
        <button
          className="chip"
          onClick={() => (fs ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
        >
          {fs ? 'Exit full screen' : 'Full screen'}
        </button>
      )}
    </div>
  )
}

function TourCaption() {
  const mode = useStore((s) => s.mode)
  const caption = useStore((s) => s.caption)
  const progress = useStore((s) => s.tourProgress)
  if (mode !== 'tour') return null
  return (
    <div className="caption">
      {caption && (
        <div className="caption__body" key={caption.title}>
          <span className="tag">{caption.code}</span>
          <div>
            <h2>{caption.title}</h2>
            <p>{caption.text}</p>
          </div>
        </div>
      )}
      <div className="caption__bar">
        <div style={{ transform: `scaleX(${progress})` }} />
      </div>
      <button className="link" onClick={() => setState({ mode: 'walk', caption: null })}>
        Stop the tour and walk freely
      </button>
    </div>
  )
}

function Hint() {
  const mode = useStore((s) => s.mode)
  const hint = useStore((s) => s.hint)
  if (!hint) return null
  const text =
    mode === 'overview'
      ? [['Drag', 'orbit'], ['Scroll', 'zoom'], ['Room label', 'step inside']]
      : mode === 'tour'
        ? [['Drag or any key', 'take over']]
        : [['Drag', 'look around'], ['Click the floor', 'walk there'], ['WASD', 'move'], ['Shift', 'hurry']]
  return (
    <div className="hint">
      <dl>
        {text.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <button className="hint__close" aria-label="Hide controls" onClick={() => setState({ hint: false })}>
        ×
      </button>
    </div>
  )
}

function MapPanel() {
  const [open, setOpen] = useState(() => window.innerWidth > 720)
  return (
    <div className={'mappanel' + (open ? ' is-open' : '')}>
      {open && <Minimap />}
      <button className="mappanel__toggle" onClick={() => setOpen(!open)}>
        {open ? 'Hide plan' : 'Show plan'}
      </button>
    </div>
  )
}

export function Hud() {
  const started = useStore((s) => s.started)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape' && getState().mode !== 'walk') setState({ mode: 'walk', caption: null })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  if (!started) return null
  return (
    <div className="hud">
      <div className="hud__top">
        <RoomBadge />
        <Settings />
      </div>
      <TourCaption />
      <div className="hud__bottom">
        <MapPanel />
        <ModeSwitch />
        <Hint />
      </div>
    </div>
  )
}

export function Intro() {
  const started = useStore((s) => s.started)
  if (started) return null
  const begin = (mode) => {
    if (mode === 'walk') {
      const [x, z] = [START.p[0] / 100, START.p[1] / 100]
      teleport(x, z, yawTo(x, z, START.look[0] / 100, START.look[1] / 100), -0.05)
    }
    setState({ started: true, mode })
  }
  return (
    <div className="intro">
      <div className="intro__card">
        <span className="tag tag--lg">A9</span>
        <h1>Apartment A9</h1>
        <p className="intro__lede">
          First floor, segment A. Four rooms and an L-shaped terrace, built from the developer&rsquo;s plan.
        </p>
        <table className="intro__rooms">
          <tbody>
            {ROOMS.filter((r) => r.id !== 'terrace').map((r) => (
              <tr key={r.id}>
                <td>
                  <span className="tag">{r.code}</span>
                </td>
                <td>{r.name}</td>
                <td>{r.area} m²</td>
              </tr>
            ))}
            <tr className="intro__total">
              <td />
              <td>Total</td>
              <td>50.00 m²</td>
            </tr>
          </tbody>
        </table>
        <div className="intro__actions">
          <button className="btn btn--primary" onClick={() => begin('tour')}>
            Start the guided tour
          </button>
          <button className="btn" onClick={() => begin('walk')}>
            Walk around freely
          </button>
        </div>
        <p className="intro__help">Drag to look around. Tap or click the floor to walk there, or use WASD on a keyboard.</p>
      </div>
    </div>
  )
}
