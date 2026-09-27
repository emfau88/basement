import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { prune, textureCompress } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'
import path from 'node:path'

const source = path.resolve('assets/source/photoreal/keyboard-mouse.glb')
const output = path.resolve('public/assets/photoreal/games/models/keyboard-mouse.glb')

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready])
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  })

const document = await io.read(source)

for (const material of document.getRoot().listMaterials()) {
  const name = material.getName()
  if (/^Mouse_(?:Body|Scroll_Wheel)$/i.test(name)) {
    // Runtime styling already discards these color maps. Removing them from
    // the payload avoids decoding textures that can never reach the screen.
    material.setBaseColorTexture(null)
  }
  if (/^USB_Connector$/i.test(name)) {
    // Connector and cable geometry remain intact. Their authored nodes are
    // hidden by the existing scene setup, so their texture allocations are
    // unnecessary and have no visual effect.
    material
      .setBaseColorTexture(null)
      .setNormalTexture(null)
      .setMetallicRoughnessTexture(null)
      .setOcclusionTexture(null)
      .setEmissiveTexture(null)
  }
}

await document.transform(
  prune(),
  textureCompress({
    encoder: sharp,
    resize: [512, 512],
    resizeFilter: 'lanczos3',
    targetFormat: 'webp',
  }),
)

await io.write(output, document)
console.log(`Optimized input-device asset: ${source} -> ${output}`)
