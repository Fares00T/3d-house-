import { EffectComposer, N8AO, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useStore } from '../store.js'
import Lights from './Lights.jsx'
import Architecture from './Architecture.jsx'
import Living from './Living.jsx'
import Bathroom from './Bathroom.jsx'
import Bedroom from './Bedroom.jsx'
import Hall from './Hall.jsx'
import { Terrace, TerraceLights, Building, Ground } from './Exterior.jsx'
import { Player, Overview, worldRef } from './Controls.jsx'

function Effects() {
  const time = useStore((s) => s.time)
  return (
    <EffectComposer multisampling={4}>
      <N8AO halfRes aoRadius={0.5} intensity={time === 'night' ? 1.6 : 2.4} distanceFalloff={0.6} quality="medium" />
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.25} intensity={time === 'night' ? 0.7 : 0.3} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.38} />
    </EffectComposer>
  )
}

export default function Scene() {
  const mode = useStore((s) => s.mode)
  const quality = useStore((s) => s.quality)
  return (
    <>
      <Lights />
      <group ref={(g) => (worldRef.current = g)}>
        <Architecture />
        <Living />
        <Bathroom />
        <Bedroom />
        <Hall />
        <Terrace />
      </group>
      <TerraceLights />
      <Building />
      <Ground />
      {mode === 'overview' && <Overview />}
      <Player />
      {quality === 'high' && <Effects />}
    </>
  )
}
