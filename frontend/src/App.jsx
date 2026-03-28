import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ResourceLibrary from './pages/ResourceLibrary';
import AddMaterial from './pages/AddMaterial';
import SavedTests from './pages/SavedTests';
import Login from './components/Login';

// Using a fallback for now, best practice is to put this in VITE_GOOGLE_CLIENT_ID in .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
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
