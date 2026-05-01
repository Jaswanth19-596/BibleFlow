import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import TopicGraphView from './pages/TopicGraphView';
import TopicsNetwork from './pages/TopicsNetwork';
import SearchPage from './pages/SearchPage';
import ContextAtlasPage from './pages/ContextAtlasPage';
import MapAtlasPage from './pages/MapAtlasPage';

function App() {
  return (
    <ReactFlowProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topic/:id" element={<TopicGraphView />} />
          <Route path="/topics/network" element={<TopicsNetwork />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/atlas" element={<ContextAtlasPage />} />
          <Route path="/map" element={<MapAtlasPage />} />
        </Routes>
      </AppShell>
    </ReactFlowProvider>
  );
}

export default App;
