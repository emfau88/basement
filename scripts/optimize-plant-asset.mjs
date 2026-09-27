import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { textureCompress } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'
import path from 'node:path'

const source = path.resolve('assets/source/photoreal/potted-plant-02.glb')
const output = path.resolve('public/assets/photoreal/games/models/potted-plant-02.glb')

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready])
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  })

const document = await io.read(source)
await document.transform(textureCompress({
  encoder: sharp,
  resize: [512, 512],
  resizeFilter: 'lanczos3',
  targetFormat: 'webp',
}))

await io.write(output, document)
console.log(`Optimized plant asset: ${source} -> ${output}`)
