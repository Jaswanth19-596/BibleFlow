import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/';
const inputs = [ ['ne_50m_land.geojson', process.argv[2]], ['ne_10m_lakes.geojson', process.argv[3]] ];
const features = [], provenance = [];
for (const [file, local] of inputs) {
  const response = local ? null : await fetch(root + file);
  if (response && !response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  const bytes = local ? readFileSync(local) : Buffer.from(await response.arrayBuffer());
  const data = JSON.parse(bytes.toString());
  for (const f of data.features) {
    const lake = file.includes('lakes');
    // Selected natural waters only; exclude the southern Dead Sea evaporation basin.
    if (lake && ![1159114879, 1159126747].includes(f.properties.ne_id)) continue;
    features.push({ type: 'Feature', properties: { water: lake }, geometry: f.geometry });
  }
  provenance.push({ url: root + file, inputSha256: createHash('sha256').update(bytes).digest('hex') });
}
writeFileSync('src/data/generated/historicalBaseMap.json', JSON.stringify({ type: 'FeatureCollection', features }));
writeFileSync('src/data/generated/historicalBaseMap.provenance.json', JSON.stringify({ source: 'Natural Earth', version: '5.1.2', inputs: provenance, license: 'Public domain', method: 'Global 50m land plus 10m Sea of Galilee and northern Dead Sea (ne_id 1159114879, 1159126747); other properties removed; geometry unchanged. No borders, roads or modern labels. Modern physical reference, not ancient coastline/hydrology reconstruction.' }, null, 2) + '\n');
