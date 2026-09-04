import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import TopicGraphView from './pages/TopicGraphView';
import TopicsNetwork from './pages/TopicsNetwork';
import SearchPage from './pages/SearchPage';
import ContextAtlasPage from './pages/ContextAtlasPage';

const MapAtlasPage = lazy(() => import('./pages/MapAtlasPage'));

function App() {
  return (
    <ReactFlowProvider>
      <AppShell>
        <Suspense fallback={<div className="flex h-full items-center justify-center bg-stone-50 text-sm font-semibold text-stone-500 dark:bg-gray-900 dark:text-stone-400">Opening the historical atlas…</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/topic/:id" element={<TopicGraphView />} />
            <Route path="/topics/network" element={<TopicsNetwork />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/atlas" element={<ContextAtlasPage />} />
            <Route path="/map" element={<MapAtlasPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ReactFlowProvider>
  );
}

export default App;
