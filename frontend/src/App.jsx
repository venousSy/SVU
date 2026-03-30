import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ResourceLibrary from './pages/ResourceLibrary';
import AddMaterial from './pages/AddMaterial';
import SavedTests from './pages/SavedTests';
import Login from './components/Login';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function App() {
  return (
    // use_fedcm_for_prompt=false disables the newer FedCM API and uses the classic
    // popup flow, which works reliably without extra server-side configuration.
    <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => console.error('GSI script failed')}>

      <Router>
        <Routes>
          <Route path="/" element={<ResourceLibrary />} />
          <Route path="/library" element={<ResourceLibrary />} />
          <Route path="/add" element={<AddMaterial />} />
          <Route path="/saved-tests" element={<SavedTests />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<ResourceLibrary />} /> {/* Fallback */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
