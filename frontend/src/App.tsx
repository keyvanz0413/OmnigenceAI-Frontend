import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LeftSideBar from './components/Dashboard/LeftSideBar';
import { useLayoutStore } from './store/useLayoutStore';
import { motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/Editor';

function App() {
  const { isSidebarExpanded } = useLayoutStore();

  return (
    <Router>
      <div className="flex min-h-screen bg-[rgb(244,245,246)] overflow-hidden">
        <LeftSideBar />

        {/* Main Content Area */}
        <motion.main
          animate={{ marginLeft: isSidebarExpanded ? 200 : 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 overflow-y-auto"
        >
          <Routes>
            <Route path="/dashboard" element={<div className="p-8"><Dashboard /></div>} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/chat" element={<div className="p-8 text-2xl font-bold text-slate-800">Chat Content Coming Soon...</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
