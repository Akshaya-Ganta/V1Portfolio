import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrthographicCamera, Text } from '@react-three/drei'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Mesh } from 'three'
import mono400 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'
import { commandNames, portfolioEntries } from './portfolioData'
import './App.css'

type TileType = 'start' | 'normal' | 'destination' | 'end'
type Direction = 'up' | 'down' | 'left' | 'right'

type BoardTile = {
  id: string
  name: string
  gridPosition: [number, number]
  position: [number, number, number]
  type: TileType
  neighbors: string[]
  world?: string
  kind?: string
  detail?: string
  symbol?: string
}

const positions: [number, number][] = [
  [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2],
  [4, -1], [4, 0], [4, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [-1, 2], [-2, 2], [-3, 2], [-4, 2],
  [-4, 1], [-4, 0], [-4, -1],
]

const destinationAt: Record<number, keyof typeof portfolioEntries> = {
  0: 'start', 1: 'about', 2: 'academics', 3: 'skills', 5: 'projects', 7: 'hackathons', 9: 'ai', 11: 'gamedev', 14: 'spatial', 16: 'experience', 19: 'resume', 21: 'contact', 23: 'end',
}

const tileIdAt = (index: number) => destinationAt[index] ?? `space-${index}`
const boardTiles: BoardTile[] = positions.map(([x, z], index) => {
  const destination = destinationAt[index]
  const info = destination ? portfolioEntries[destination] : undefined
  return {
    id: tileIdAt(index),
    name: info?.name ?? 'PATH',
    gridPosition: [x, z],
    position: [x * 0.92, 0, z * 0.92],
    type: destination === 'start' ? 'start' : destination === 'end' ? 'end' : destination ? 'destination' : 'normal',
    neighbors: [tileIdAt((index + positions.length - 1) % positions.length), tileIdAt((index + 1) % positions.length)],
    ...info,
  }
})
const tileById = new Map(boardTiles.map((tile) => [tile.id, tile]))

function FlatPrint({ position, size, color }: { position: [number, number, number]; size: [number, number]; color: string }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshBasicMaterial color={color} /></mesh>
}

function BoardTile({ tile, active, hovered, onHover }: { tile: BoardTile; active: boolean; hovered: boolean; onHover: (id: string | null) => void }) {
  const pulseRef = useRef<Mesh>(null)
  useFrame(() => {
    if (pulseRef.current && active) pulseRef.current.scale.setScalar(1 + Math.sin(performance.now() / 220) * 0.04)
  })
  const highlighted = active || hovered
  const tileColor = active ? '#8f791e' : hovered ? '#7e7020' : tile.type === 'destination' ? '#526047' : '#3d4b3f'
  const borderColor = active || hovered ? '#f3d33b' : tile.type === 'destination' ? '#8c9166' : '#596854'
  const displayName = tile.name === 'ABOUT ME' ? 'ABOUT\nME' : tile.name === 'GAME DEV' ? 'GAME\nDEV' : tile.name === 'AI / AUTOMATION' ? 'AI' : tile.name === 'SPATIAL / 3D' ? 'SPATIAL' : tile.name
  return <group position={tile.position} onPointerEnter={(event) => { event.stopPropagation(); onHover(tile.id) }} onPointerLeave={(event) => { event.stopPropagation(); onHover(null) }}>
    <FlatPrint position={[0, 0.08, 0]} size={[0.84, 0.84]} color={tileColor} />
    <mesh ref={pulseRef} position={[0, 0.086, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.37, 0.405, 4]} /><meshBasicMaterial color={borderColor} transparent opacity={highlighted ? 1 : 0.75} /></mesh>
    {hovered && !active && <pointLight position={[0, 0.25, 0]} intensity={0.35} distance={1.4} color="#f3d33b" />}
    {(tile.type === 'destination' || tile.type === 'start' || tile.type === 'end') && <Html position={[0, 0.115, 0]} center transform={false} style={{ color: active ? '#171b12' : '#d9d29b', fontFamily: 'IBM Plex Mono, monospace', fontSize: `${displayName.includes('\n') ? 11 : displayName.length > 9 ? 10 : 12}px`, fontWeight: 500, lineHeight: .92, letterSpacing: '.02em', textAlign: 'center', whiteSpace: 'pre-line', width: '72px', pointerEvents: 'none', textShadow: active ? 'none' : '0 1px 2px #151b13' }}>{displayName}</Html>}
  </group>
}

function BoardPath() {
  return <group>{boardTiles.map((tile) => tile.neighbors.map((neighborId) => {
    const neighbor = tileById.get(neighborId)
    if (!neighbor || tile.id > neighbor.id) return null
    const midpoint: [number, number, number] = [(tile.position[0] + neighbor.position[0]) / 2, 0.075, (tile.position[2] + neighbor.position[2]) / 2]
    const horizontal = tile.position[2] === neighbor.position[2]
    return <FlatPrint key={`${tile.id}-${neighbor.id}`} position={midpoint} size={horizontal ? [0.08, 0.11] : [0.11, 0.08]} color="#8a8052" />
  }))}</group>
}

const particlePoints: Array<[number, number, number]> = [
  [-3.2, 0.35, -1.3], [3.1, 0.5, -1.4], [-3.4, 0.28, 1.35], [3.25, 0.42, 1.2],
  [-2.1, 0.58, 0.1], [2.2, 0.38, -0.1], [-4.15, 0.7, 0.2], [4.1, 0.52, 0.5],
  [-1.1, 0.42, 1.8], [1.2, 0.65, -1.8],
]

function DataParticles() {
  const particlesRef = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (particlesRef.current) particlesRef.current.rotation.y += delta * 0.025
  })
  return <group ref={particlesRef}>{particlePoints.map(([x, y, z], index) => <mesh key={index} position={[x, y, z]}><sphereGeometry args={[0.018 + (index % 3) * 0.006, 5, 5]} /><meshBasicMaterial color="#7f8d5b" transparent opacity={0.24} /></mesh>)}</group>
}

function CentralWorkspace() {
  return <group position={[0, 0.09, 0]}>
    <pointLight position={[0, 1.5, 0.1]} intensity={1.15} distance={4.2} color="#c2ae60" />
    <FlatPrint position={[0, 0.012, 0]} size={[3.2, 2.05]} color="#283328" />
    <mesh position={[0, 0.27, -0.28]} castShadow><boxGeometry args={[1.8, 0.15, 0.78]} /><meshStandardMaterial color="#646a50" roughness={1} /></mesh>
    <mesh position={[0, 0.93, -0.33]} castShadow><boxGeometry args={[1.12, 0.92, 0.24]} /><meshStandardMaterial color="#565c48" roughness={1} /></mesh>
    <mesh position={[0, 0.95, -0.21]}><planeGeometry args={[0.86, 0.58]} /><meshBasicMaterial color="#344d32" /></mesh>
    <Text position={[-0.35, 1.02, -0.202]} font={mono400} fontSize={0.11} maxWidth={0.72} anchorX="left" anchorY="middle" lineHeight={1.05} color="#d8d17e" outlineColor="#27321f" outlineWidth={0.004}>{`AKSHAYA OS\nSYSTEM ONLINE\n----------------\nSELECT A\nDESTINATION\nSTATUS: READY_`}</Text>
    {[0.82, 0.91, 1.0, 1.09].map((y) => <mesh key={y} position={[0, y, -0.203]}><planeGeometry args={[0.76, 0.008]} /><meshBasicMaterial color="#8b9252" transparent opacity={0.12} /></mesh>)}
    <mesh position={[0, 0.4, -0.3]}><boxGeometry args={[0.18, 0.22, 0.2]} /><meshStandardMaterial color="#777859" roughness={1} /></mesh>
    <mesh position={[0, 0.33, 0.12]}><boxGeometry args={[0.72, 0.08, 0.3]} /><meshStandardMaterial color="#777859" roughness={1} /></mesh>
    <mesh position={[-0.82, 0.33, -0.24]}><boxGeometry args={[0.28, 0.46, 0.4]} /><meshStandardMaterial color="#777859" roughness={1} /></mesh>
    <mesh position={[0.82, 0.31, -0.28]}><boxGeometry args={[0.46, 0.09, 0.32]} /><meshStandardMaterial color="#777859" roughness={1} /></mesh>
    <mesh position={[0.82, 0.47, -0.34]}><boxGeometry args={[0.25, 0.07, 0.2]} /><meshStandardMaterial color="#b0a365" roughness={1} /></mesh>
    <mesh position={[-0.82, 0.24, 0.34]}><boxGeometry args={[0.4, 0.08, 0.28]} /><meshStandardMaterial color="#999064" roughness={1} /></mesh>
    <mesh position={[-0.82, 0.34, 0.34]}><boxGeometry args={[0.32, 0.06, 0.18]} /><meshStandardMaterial color="#b0a365" roughness={1} /></mesh>
    <mesh position={[0.82, 0.35, 0.32]}><cylinderGeometry args={[0.12, 0.16, 0.24, 5]} /><meshStandardMaterial color="#53654b" roughness={1} /></mesh>
    <mesh position={[0.82, 0.62, 0.32]}><coneGeometry args={[0.26, 0.5, 5]} /><meshStandardMaterial color="#53654b" roughness={1} /></mesh>
  </group>
}

function FollowCamera({ tileIndex, mouse }: { tileIndex: number; mouse: MutableRefObject<{ x: number; y: number }> }) {
  const target = boardTiles[tileIndex].position
  const cameraTarget = useMemo(() => ({ x: target[0] * 0.12 + 5.4, y: 8.1, z: target[2] * 0.12 + 6.8 }), [target])
  useFrame(({ camera }, delta) => {
    const parallaxX = mouse.current.x * 0.28
    const parallaxY = mouse.current.y * 0.2
    camera.position.x += (cameraTarget.x + parallaxX - camera.position.x) * Math.min(1, delta * 3)
    camera.position.y += (cameraTarget.y - parallaxY - camera.position.y) * Math.min(1, delta * 3)
    camera.position.z += (cameraTarget.z - camera.position.z) * Math.min(1, delta * 3)
    camera.lookAt(target[0] * 0.12 + parallaxX * 0.22, -parallaxY * 0.12, target[2] * 0.12)
  })
  return null
}

function Board({ tileIndex, hoveredTile, onHover, mouse }: { tileIndex: number; hoveredTile: string | null; onHover: (id: string | null) => void; mouse: MutableRefObject<{ x: number; y: number }> }) {
  return <>
    <ambientLight intensity={0.7} color="#a5a78e" />
    <directionalLight position={[-5, 8, 4]} intensity={1.7} color="#d2c89b" castShadow shadow-mapSize={[1024, 1024]} />
    <OrthographicCamera makeDefault position={[5.4, 8.1, 6.8]} zoom={58} />
    <mesh position={[0, -0.24, 0]} receiveShadow><boxGeometry args={[10.4, 0.46, 6]} /><meshStandardMaterial color="#10150f" roughness={1} /></mesh>
    <FlatPrint position={[0, 0.005, 0]} size={[10.05, 5.65]} color="#263328" />
    <BoardPath />
    <CentralWorkspace />
    <DataParticles />
    {boardTiles.map((tile, index) => <BoardTile key={tile.id} tile={tile} active={index === tileIndex} hovered={tile.id === hoveredTile} onHover={onHover} />)}
    <FollowCamera tileIndex={tileIndex} mouse={mouse} />
  </>
}

function PlaceholderWorld() {
  return <><ambientLight intensity={0.45} color="#8b917c" /><directionalLight position={[-4, 7, 4]} intensity={1.5} color="#c8bd8a" castShadow /><OrthographicCamera makeDefault position={[5, 6, 7]} zoom={55} /><mesh position={[0, -0.2, 0]}><boxGeometry args={[7, 0.45, 5]} /><meshStandardMaterial color="#151a16" /></mesh><FlatPrint position={[0, 0.02, 0]} size={[6.5, 4.5]} color="#283129" /><mesh position={[0, 0.8, -0.7]}><boxGeometry args={[1.3, 1.5, 0.65]} /><meshStandardMaterial color="#4b5147" /></mesh><FlatPrint position={[0, 0.04, -1.05]} size={[0.75, 0.42]} color="#a79b55" /></>
}

function directionForKey(key: string): Direction | null {
  if (key === 'arrowup' || key === 'w') return 'up'
  if (key === 'arrowdown' || key === 's') return 'down'
  if (key === 'arrowleft' || key === 'a') return 'left'
  if (key === 'arrowright' || key === 'd') return 'right'
  return null
}

function App() {
  const [tileIndex, setTileIndex] = useState(0)
  const [worldOpen, setWorldOpen] = useState(false)
  const [moving, setMoving] = useState(false)
  const [booting, setBooting] = useState(true)
  const [bootProgress, setBootProgress] = useState(0)
  const [bootFading, setBootFading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionKind, setTransitionKind] = useState<'boot' | 'world' | 'return' | null>('boot')
  const [transitionMessage, setTransitionMessage] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandValue, setCommandValue] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const [startPulse, setStartPulse] = useState(false)
  const commandInputRef = useRef<HTMLInputElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const currentTile = boardTiles[tileIndex]
  const entry = portfolioEntries[currentTile.id] ?? portfolioEntries.start

  useEffect(() => {
    const start = performance.now()
    const duration = 2800
    let frame = 0
    let finishTimer = 0
    const tick = (now: number) => {
      const rawProgress = Math.min(100, ((now - start) / duration) * 100)
      const easedProgress = 100 * (1 - Math.pow(1 - rawProgress / 100, 2.2))
      setBootProgress(easedProgress)
      if (rawProgress < 100) frame = requestAnimationFrame(tick)
      else {
        setBootProgress(100)
        setTransitionMessage('SYSTEM ONLINE')
        finishTimer = window.setTimeout(() => {
          setBootFading(true)
          window.setTimeout(() => { setBooting(false); setTransitionKind(null) }, 520)
        }, 420)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); window.clearTimeout(finishTimer) }
  }, [])

  useEffect(() => {
    const handleMouse = (event: MouseEvent) => {
      if (booting) return
      const x = (event.clientX / window.innerWidth - 0.5) * 2
      const y = (event.clientY / window.innerHeight - 0.5) * 2
      mouseRef.current.x = x
      mouseRef.current.y = y
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [booting])

  useEffect(() => {
    if (commandOpen) commandInputRef.current?.focus()
  }, [commandOpen])

  const selectCommand = (name: string) => {
    const index = boardTiles.findIndex((tile) => tile.id === name)
    if (index >= 0) setTileIndex(index)
  }

  const executeCommand = (rawCommand: string) => {
    const command = rawCommand.trim().toLowerCase()
    if (!command) return
    if (command === 'clear') { setCommandHistory([]); return }
    if (command === 'help') {
      setCommandHistory(['> AKSHAYA_OS HELP', 'NAVIGATION: ARROW KEYS / ENTER / ESC', 'COMMAND MODE: / OR ~', `AVAILABLE: ${commandNames.join(' / ')}`])
    } else if (command === 'map') {
      setCommandHistory(['> JOURNEY MAP', commandNames.map((name) => portfolioEntries[name].name).join('  /  ')])
    } else if (commandNames.includes(command)) {
      selectCommand(command)
      setCommandHistory([`> LOCATION LOADED: ${portfolioEntries[command].name}`, portfolioEntries[command].kind])
      setCommandOpen(false)
    } else {
      setCommandHistory([`> COMMAND NOT FOUND: ${command}`, 'TYPE HELP FOR AVAILABLE COMMANDS'])
    }
    setCommandValue('')
  }

  const accessWorld = useCallback(() => {
    if (!currentTile.world || transitioning) return
    setTransitionMessage(`> ACCESSING ${entry.kind.replaceAll(' ', '_')}...`)
    setTransitionKind('world')
    setTransitioning(true)
    window.setTimeout(() => { setWorldOpen(true); setTransitioning(false); setTransitionKind(null) }, 820)
  }, [currentTile.world, entry.kind, transitioning])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (booting || transitioning) return
      if (event.key === '/' || event.key === '~') { event.preventDefault(); setCommandOpen(true); return }
      if (commandOpen) { if (event.key === 'Escape') setCommandOpen(false); return }
      if (event.key === 'Escape') {
        if (worldOpen) {
          setTransitionMessage('> CLOSING MODULE_\nSAVING POSITION_\n................. OK\n\n> RETURNING TO JOURNEY MAP...')
          setTransitionKind('return')
          setTransitioning(true)
          window.setTimeout(() => { setWorldOpen(false); setTransitioning(false); setTransitionKind(null) }, 720)
        }
        return
      }
      if (worldOpen) return
      if (event.key === 'Enter') {
        if (currentTile.id === 'start') {
          setStartPulse(true)
          window.setTimeout(() => setStartPulse(false), 700)
        }
        accessWorld()
        return
      }
      if (moving) return
      const direction = directionForKey(event.key.toLowerCase())
      if (!direction) return
      const nextIndex = currentTile.neighbors.map((id) => boardTiles.findIndex((tile) => tile.id === id)).find((index) => {
        if (index < 0) return false
        const neighbor = boardTiles[index]
        const dx = neighbor.gridPosition[0] - currentTile.gridPosition[0]
        const dz = neighbor.gridPosition[1] - currentTile.gridPosition[1]
        return (direction === 'right' && dx > 0) || (direction === 'left' && dx < 0) || (direction === 'down' && dz > 0) || (direction === 'up' && dz < 0)
      })
      if (nextIndex === undefined) return
      setTileIndex(nextIndex); setMoving(true); window.setTimeout(() => setMoving(false), 300)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [accessWorld, booting, commandOpen, currentTile, moving, transitioning, worldOpen])

  const bootStage = bootProgress < 15 ? 'BOOTING SYSTEM...' : bootProgress < 35 ? 'INITIALIZING SPATIAL GRID...' : bootProgress < 55 ? 'LOADING INTERFACE MODULES...' : bootProgress < 75 ? 'SYNCHRONIZING DATA...' : bootProgress < 95 ? 'ESTABLISHING CONNECTION...' : 'SYSTEM ONLINE'
  const progressBlocks = 20
  const filledBlocks = Math.round((bootProgress / 100) * progressBlocks)

  return <main className="terminal-shell">
    <header className="topbar"><span className="signal-dot" /><span>SYSTEM // AKSHAYA_PORTFOLIO</span><span className="topbar-status">BUILD 01.09 // ONLINE</span></header>
    <section className="world-frame">
      <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true }}>{worldOpen ? <PlaceholderWorld /> : <Board tileIndex={tileIndex} hoveredTile={hoveredTile} onHover={setHoveredTile} mouse={mouseRef} />}</Canvas>
      <div className="scanlines" /><div className="scan-sweep" />
      {(booting || transitioning) && <div className={`system-overlay transition-${transitionKind ?? 'world'}${bootFading ? ' boot-fading' : ''}`}><div>{booting ? 'AKSHAYA_OS v1.0' : transitionMessage}</div><div>------------------------------</div><div>{booting ? <>{bootStage}<br /><br /><span className="boot-bar">[{'█'.repeat(filledBlocks)}{'░'.repeat(progressBlocks - filledBlocks)}] {Math.round(bootProgress)}%</span><br /><br />{bootProgress > 95 ? '&gt; SYSTEM ONLINE' : 'AKSHAYA_OS // SYSTEM INITIALIZING'}</> : 'VERIFYING MODULE_\n................. OK\n\nLOADING WORLD_\n████████████████ 100%\n\n&gt; CONNECTION ESTABLISHED_'}</div></div>}
      <div className="coordinates">{worldOpen ? 'SUBWORLD / MEMORY BUFFER' : `SECTOR ${String(tileIndex + 1).padStart(2, '0')} / GRID ${String(100 + tileIndex).padStart(3, '0')}`}<br />LOCAL TIME 03:17</div>
      <div className="world-label">{worldOpen ? `${currentTile.name} // WORLD` : "AKSHAYA'S"}<br /><span>{worldOpen ? 'PLACEHOLDER SCENE' : 'JOURNEY BOARD'}</span></div>
      {!worldOpen && <div className="system-telemetry"><span>SYSTEM TELEMETRY</span><b>----------------</b><span>NODES&nbsp;&nbsp;&nbsp;&nbsp;{boardTiles.length}</span><span>ACTIVE&nbsp;&nbsp;&nbsp;01</span><span>LINK&nbsp;&nbsp;&nbsp;&nbsp;STABLE</span><span>SYNC&nbsp;&nbsp;&nbsp;&nbsp;100%</span></div>}
    </section>
    <footer className="command-panel">
      <div className="panel-heading"><span>LOCATION: {currentTile.name}</span><span>STATUS: <strong>{worldOpen ? 'EXPLORING' : transitioning ? 'LOADING' : startPulse ? 'INITIALIZING' : 'STABLE'}</strong></span></div>
      <div className="station-readout"><div className="readout-title">&gt; {worldOpen ? `${currentTile.name} // PLACEHOLDER WORLD` : entry.kind}</div><div className="readout-detail">{worldOpen ? 'A temporary room has been loaded for this destination. Press ESC to return._' : `${entry.detail} ${entry.action}`}</div>{commandHistory.map((line) => <div key={line} className="command-history">{line}</div>)}</div>
      <div className="controls"><span><kbd>ENTER</kbd> {worldOpen ? 'UNAVAILABLE' : entry.action.replace('[ENTER] ', '')}</span><span><kbd>ESC</kbd> {worldOpen ? 'RETURN' : 'RESET'}</span><span><kbd>↑ ↓ ← →</kbd> MOVE</span><span><kbd>/</kbd> COMMAND</span></div>
      {commandOpen && <form className="terminal-command" onSubmit={(event) => { event.preventDefault(); executeCommand(commandValue) }}><label>AKSHAYA_OS &gt;</label><input ref={commandInputRef} value={commandValue} onChange={(event) => setCommandValue(event.target.value)} onBlur={() => setCommandOpen(false)} aria-label="AKSHAYA OS command" autoComplete="off" /></form>}
    </footer>
  </main>
}

export default App
