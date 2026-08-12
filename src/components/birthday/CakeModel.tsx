'use client'

import { useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF, Float, PresentationControls, Center, useAnimations } from '@react-three/drei'

export function CakeModel({ playAnimation = false, onAnimationComplete }: { playAnimation?: boolean, onAnimationComplete?: () => void }) {
  const { scene, animations } = useGLTF('/models/cake-compressed.glb')
  const { actions, mixer } = useAnimations(animations, scene)

  useEffect(() => {
    if (actions && playAnimation) {
      // Play all available built-in animations only once
      Object.values(actions).forEach((action) => {
        if (action) {
          action.setLoop(THREE.LoopOnce, 1)
          action.clampWhenFinished = true
          action.play()
        }
      })

      const handleFinished = () => {
        if (onAnimationComplete) onAnimationComplete()
      }

      mixer.addEventListener('finished', handleFinished)
      return () => {
        mixer.removeEventListener('finished', handleFinished)
      }
    }
  }, [actions, playAnimation, mixer, onAnimationComplete])

  return (
    <PresentationControls
      global
      zoom={1.5}
      rotation={[0.3, -Math.PI / 4, 0]}
      polar={[-Math.PI / 6, Math.PI / 6]}
      azimuth={[-Math.PI / 4, Math.PI / 4]}
      snap={true}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <Center position={[0, 4, 0]}>
          <primitive object={scene} scale={2} />
        </Center>
      </Float>
    </PresentationControls>
  )
}

useGLTF.preload('/models/cake-compressed.glb')
