import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import TopicGraphView from './pages/TopicGraphView';
import TopicsNetwork from './pages/TopicsNetwork';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <ReactFlowProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topic/:id" element={<TopicGraphView />} />
          <Route path="/topics/network" element={<TopicsNetwork />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </AppShell>
    </ReactFlowProvider>
  );
}

export default App;
