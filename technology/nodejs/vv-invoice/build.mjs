import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: ['node16.17'],
  outfile: 'out.js',
})