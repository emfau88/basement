import * as THREE from 'three'

interface CloudLayer {
  update(now: number, visibleView: boolean): boolean
  dispose(): void
}

const ATLAS_WIDTH = 2172
const ATLAS_HEIGHT = 724

function cloudGeometry(width: number, height: number, crop: readonly [number, number, number, number]): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, height)
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute
  const [left, top, cropWidth, cropHeight] = crop
  const u0 = left / ATLAS_WIDTH
  const u1 = (left + cropWidth) / ATLAS_WIDTH
  const v0 = 1 - (top + cropHeight) / ATLAS_HEIGHT
  const v1 = 1 - top / ATLAS_HEIGHT
  for (let index = 0; index < uv.count; index += 1) {
    uv.setXY(index, THREE.MathUtils.lerp(u0, u1, uv.getX(index)), THREE.MathUtils.lerp(v0, v1, uv.getY(index)))
  }
  return geometry
}

// Two photographic cutouts move across the existing window plane. The shader
// neutralizes colored extraction fringes and fades them before the distant
// hills and castle, while the real window trim still occludes them in 3D.
export function createWindowClouds(backdrop: THREE.Object3D, atlas: THREE.Texture): CloudLayer {
  const root = new THREE.Group()
  root.name = 'CastleWindowClouds'
  const material = new THREE.ShaderMaterial({
    uniforms: { atlas: { value: atlas }, opacity: { value: 0.7 } },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vUv = uv;
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D atlas;
      uniform float opacity;
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vec4 source = texture2D(atlas, vUv);
        float neutral = dot(source.rgb, vec3(0.299, 0.587, 0.114));
        float edge = smoothstep(0.42, 0.88, source.a);
        float horizon = smoothstep(3.62, 3.84, vWorld.y);
        float castle = 1.0 - smoothstep(1.6, 2.5, vWorld.x);
        float windowLeft = smoothstep(-3.12, -2.78, vWorld.x);
        float windowRight = 1.0 - smoothstep(2.72, 3.12, vWorld.x);
        float alpha = edge * horizon * castle * windowLeft * windowRight * opacity;
        if (alpha < 0.005) discard;
        gl_FragColor = vec4(vec3(max(0.82, neutral)), alpha);
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    fog: false,
  })
  const first = new THREE.Mesh(cloudGeometry(2.38, 1.21, [0, 50, 1200, 610]), material)
  const second = new THREE.Mesh(cloudGeometry(2.0, 1.23, [1180, 30, 992, 610]), material)
  first.name = 'CastleCloudA'
  second.name = 'CastleCloudB'
  first.position.set(-4.5, 4.02, -6.18)
  second.position.set(-4.5, 4.1, -6.175)
  root.add(first, second)
  backdrop.parent?.add(root)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  let lastFirst = Number.NaN
  let lastSecond = Number.NaN
  const update = (now: number, visibleView: boolean): boolean => {
    if (!visibleView) return false
    const firstPhase = reducedMotion.matches ? 0.34 : ((now / 1000) % 150) / 150
    const secondPhase = reducedMotion.matches ? 0.84 : (firstPhase + 0.5) % 1
    const firstX = THREE.MathUtils.lerp(-4.65, 4.65, firstPhase)
    const secondX = THREE.MathUtils.lerp(-4.5, 4.5, secondPhase)
    if (firstX === lastFirst && secondX === lastSecond) return false
    first.position.x = firstX
    second.position.x = secondX
    lastFirst = firstX
    lastSecond = secondX
    return true
  }
  update(performance.now(), true)
  return {
    update,
    dispose() {
      root.removeFromParent()
      first.geometry.dispose()
      second.geometry.dispose()
      material.dispose()
    },
  }
}
