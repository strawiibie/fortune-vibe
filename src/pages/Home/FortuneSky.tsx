import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from './Home.module.css'

export function FortuneSky() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 80)
    camera.position.set(0, 0.2, 9)

    const galaxyTilt = new THREE.Group()
    const galaxy = createGalaxy(window.innerWidth < 700 ? 1100 : 1900)
    galaxyTilt.add(galaxy)
    galaxyTilt.rotation.x = 0.95
    galaxyTilt.position.set(0, 0.7, -1.2)
    scene.add(galaxyTilt)

    const dust = createDust(420)
    scene.add(dust)

    const wheel = createWheel()
    wheel.position.set(0, 0.35, -0.4)
    scene.add(wheel)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const clock = new THREE.Clock()
    let frame = 0

    const render = () => {
      const elapsed = clock.getElapsedTime()
      if (!reduceMotion) {
        galaxy.rotation.z = elapsed * 0.11
        wheel.rotation.z = elapsed * 0.16
      }
      renderer.render(scene, camera)
    }

    const loop = () => {
      frame = window.requestAnimationFrame(loop)
      render()
    }
    loop()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      disposeObject(galaxyTilt)
      disposeObject(dust)
      disposeObject(wheel)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className={styles.motion} aria-hidden="true" />
}

function createGalaxy(count: number) {
  const galaxy = new THREE.Group()
  galaxy.add(createSpiral(count, 0.034, 0.9))
  galaxy.add(createSpiral(Math.floor(count * 0.1), 0.07, 1))
  return galaxy
}

function createSpiral(count: number, size: number, opacity: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const arms = 3

  for (let index = 0; index < count; index += 1) {
    const radius = Math.pow(Math.random(), 0.65) * 6.4
    const branch = index % arms
    const angle = (branch / arms) * Math.PI * 2 + radius * 0.55
    const spread = Math.pow(Math.random(), 3) * (0.12 + radius * 0.09)
    const drift = (Math.random() - 0.5) * spread

    positions[index * 3] = Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * drift
    positions[index * 3 + 1] = (Math.random() - 0.5) * 0.16
    positions[index * 3 + 2] = Math.sin(angle) * radius + Math.sin(angle + Math.PI / 2) * drift

    const warmth = 1 - radius / 6.4
    colors[index * 3] = 0.72 + warmth * 0.28
    colors[index * 3 + 1] = 0.48 + warmth * 0.32
    colors[index * 3 + 2] = 0.95 - warmth * 0.2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
}

function createDust(count: number) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 22
    positions[index * 3 + 1] = (Math.random() - 0.5) * 14
    positions[index * 3 + 2] = (Math.random() - 0.5) * 12
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    size: 0.018,
    color: 0xf6e7c4,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  })

  return new THREE.Points(geometry, material)
}

function createWheel() {
  const wheel = new THREE.Group()
  const gold = new THREE.LineBasicMaterial({
    color: 0xe4c56a,
    transparent: true,
    opacity: 0.55,
  })
  const pale = new THREE.LineBasicMaterial({
    color: 0xf8e7b0,
    transparent: true,
    opacity: 0.35,
  })

  wheel.add(new THREE.LineLoop(circleGeometry(3.15, 160), gold))
  wheel.add(new THREE.LineLoop(circleGeometry(2.55, 120), pale))
  wheel.add(new THREE.LineLoop(circleGeometry(0.42, 48), gold))

  const spokePoints: THREE.Vector3[] = []
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2
    spokePoints.push(new THREE.Vector3(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0))
    spokePoints.push(new THREE.Vector3(Math.cos(angle) * 3.15, Math.sin(angle) * 3.15, 0))
  }
  wheel.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(spokePoints), pale))

  const tickPositions = new Float32Array(48 * 3)
  for (let index = 0; index < 48; index += 1) {
    const angle = (index / 48) * Math.PI * 2
    tickPositions[index * 3] = Math.cos(angle) * 3.15
    tickPositions[index * 3 + 1] = Math.sin(angle) * 3.15
    tickPositions[index * 3 + 2] = 0
  }
  const ticks = new THREE.BufferGeometry()
  ticks.setAttribute('position', new THREE.BufferAttribute(tickPositions, 3))
  wheel.add(
    new THREE.Points(
      ticks,
      new THREE.PointsMaterial({
        size: 0.045,
        color: 0xf6e3a1,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    ),
  )

  return wheel
}

function circleGeometry(radius: number, segments: number) {
  const points: THREE.Vector3[] = []
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
      child.geometry.dispose()
      const material = child.material
      if (Array.isArray(material)) material.forEach((item) => item.dispose())
      else material.dispose()
    }
  })
}
