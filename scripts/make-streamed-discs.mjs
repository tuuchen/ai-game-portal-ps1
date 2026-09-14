import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const sector = 2352;

function fnv1a32(buf) {
  let hash = 0x811c9dc5;
  for (const byte of buf) hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  return hash;
}

function flac(raw, output) {
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 's16le', '-ar', '44100', '-ac', '2', '-i', 'pipe:0',
    '-compression_level', '12', output,
  ], { input: raw, maxBuffer: 128 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.toString());
}

function writeGame({ dir, bin, cue, cuts, title }) {
  const out = path.join(root, 'docs', dir);
  fs.mkdirSync(out, { recursive: true });
  const disc = fs.readFileSync(bin);
  if (disc.length % sector) throw new Error(`${bin} is not sector aligned`);
  const dataEnd = cuts[0] * sector;
  const data = disc.subarray(0, dataEnd);
  const gz = zlib.gzipSync(data, { level: 9, mtime: 0 });
  fs.writeFileSync(path.join(out, 'demo-data.bin.gz'), gz);
  const lines = [`data demo-data.bin.gz ${gz.length} ${data.length} ${fnv1a32(data)}`];
  for (let i = 0; i < cuts.length; i++) {
    const start = cuts[i] * sector;
    const end = (cuts[i + 1] ?? disc.length / sector) * sector;
    const audio = disc.subarray(start, end);
    const name = `track-${String(i + 2).padStart(2, '0')}.flac`;
    const output = path.join(out, name);
    flac(audio, output);
    lines.push(`track ${i + 2} ${name} ${fs.statSync(output).size} ${audio.length} ${fnv1a32(audio)} ${title[i] ?? ''}`.trim());
  }
  fs.copyFileSync(cue, path.join(out, 'demo-disc.cue'));
  fs.writeFileSync(path.join(out, 'web-manifest.txt'), `${lines.join('\n')}\n`);
}

const workspace = path.resolve(root, '..');
const voxideBin = path.join(workspace, 'src', 'voxide', 'release', 'voxide.bin');
const voxideCue = path.join(workspace, 'src', 'voxide', 'release', 'voxide.cue');
const cortexRoot = path.join(workspace, 'downloads', 'cortex');

// The streamed-disc frontend expects at least one CD-DA track. VoXide is a
// data-only disc, so append three seconds of silence without touching track 1.
const voxide = fs.readFileSync(voxideBin);
const voxideWithSilence = Buffer.concat([voxide, Buffer.alloc(225 * sector)]);
const voxideDelivery = path.join(workspace, 'voxide-delivery.bin');
const voxideDeliveryCue = path.join(workspace, 'voxide-delivery.cue');
fs.writeFileSync(voxideDelivery, voxideWithSilence);
const voxideSectors = voxide.length / sector;
const pregapStart = voxideSectors;
const index1 = pregapStart + 150;
const msf = n => `${String(Math.floor(n / 4500)).padStart(2, '0')}:${String(Math.floor((n % 4500) / 75)).padStart(2, '0')}:${String(n % 75).padStart(2, '0')}`;
fs.writeFileSync(voxideDeliveryCue, `FILE "voxide-delivery.bin" BINARY\n  TRACK 01 MODE2/2352\n    INDEX 01 00:00:00\n  TRACK 02 AUDIO\n    INDEX 00 ${msf(pregapStart)}\n    INDEX 01 ${msf(index1)}\n`);
writeGame({ dir: 'voxide-v0.1.11', bin: voxideDelivery, cue: voxideDeliveryCue, cuts: [voxideSectors], title: ['SILENCE'] });

writeGame({
  dir: 'cortex-ignition-2026.09.05',
  bin: path.join(cortexRoot, 'Cortex Ignition Tech Demo.bin'),
  cue: path.join(cortexRoot, 'Cortex Ignition Tech Demo.cue'),
  cuts: [1577, 7182],
  title: ['CORTEX IGNITION COMBAT', 'CORTEX IGNITION MENU'],
});
