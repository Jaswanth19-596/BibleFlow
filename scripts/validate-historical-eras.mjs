import { createServer } from 'vite';
const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { HISTORICAL_CONTENT } = await server.ssrLoadModule('/src/data/historicalEraContent.ts');
  const { validateHistoricalEras } = await server.ssrLoadModule('/src/lib/validateHistoricalEras.ts');
  const errors = validateHistoricalEras(HISTORICAL_CONTENT);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Validated ${HISTORICAL_CONTENT.eras.length} eras, ${HISTORICAL_CONTENT.annotations.length} place annotations, ${HISTORICAL_CONTENT.areas.length} site contexts and ${HISTORICAL_CONTENT.routes.length} itineraries.`);
} finally { await server.close(); }
