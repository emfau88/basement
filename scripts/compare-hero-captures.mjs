import sharp from 'sharp'
import path from 'node:path'

const [beforeLabel, afterLabel, target = 'input-detail'] = process.argv.slice(2)
if (!beforeLabel || !afterLabel) throw new Error('Pass before and after labels')

const directory = path.resolve('docs/qa/bulk-24-7-hero-assets')
if (!['input-detail', 'plant-detail', 'games'].includes(target)) throw new Error(`Unsupported comparison target: ${target}`)
const capture = (label) => path.join(directory, `${label}-${target}.png`)
const before = await sharp(capture(beforeLabel)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const after = await sharp(capture(afterLabel)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
if (before.info.width !== after.info.width || before.info.height !== after.info.height || before.info.channels !== after.info.channels) {
  throw new Error('Capture dimensions do not match')
}

let absoluteDifference = 0
let changedChannels = 0
for (let index = 0; index < before.data.length; index += 1) {
  const difference = Math.abs(before.data[index] - after.data[index])
  absoluteDifference += difference
  if (difference > 8) changedChannels += 1
}

console.log(JSON.stringify({
  before: capture(beforeLabel),
  after: capture(afterLabel),
  dimensions: `${before.info.width}x${before.info.height}`,
  meanAbsoluteChannelDifference: absoluteDifference / before.data.length,
  changedChannelRatioOver8: changedChannels / before.data.length,
}, null, 2))
