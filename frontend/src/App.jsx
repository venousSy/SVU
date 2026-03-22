import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResourceLibrary from './pages/ResourceLibrary';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ResourceLibrary />} />
        <Route path="/library" element={<ResourceLibrary />} />
        <Route path="*" element={<ResourceLibrary />} /> {/* Fallback */}
      </Routes>
    </Router>
  );
}

export default App;
